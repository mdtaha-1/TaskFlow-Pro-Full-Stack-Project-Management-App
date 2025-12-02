import express from 'express';
import { body, validationResult } from 'express-validator';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { generateToken, sendEmail, emailTemplates } from '../utils/emailService.js';

const router = express.Router();

// Send invitation
router.post('/send', auth, [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('role').isIn(['admin', 'project-manager', 'developer', 'designer', 'qa', 'viewer']).withMessage('Invalid role'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role, message } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if invitation already exists and is pending
    const existingInvitation = await Invitation.findOne({ 
      email, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'An invitation has already been sent to this email' });
    }

    // Get inviter information
    const inviter = await User.findById(req.userId);
    if (!inviter) {
      return res.status(404).json({ message: 'Inviter not found' });
    }

    // Generate invitation token
    const token = generateToken();

    // Create invitation
    const invitation = new Invitation({
      email,
      role,
      invitedBy: req.userId,
      message,
      token
    });

    await invitation.save();

    // Create invitation link
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/invite/${token}`;

    // Send invitation email
    const emailTemplate = emailTemplates.invitation(
      inviter.name,
      role,
      message,
      inviteLink
    );

    await sendEmail(email, emailTemplate);

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({ message: 'Server error while sending invitation' });
  }
});

// Get invitation by token
router.get('/:token', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or expired' });
    }

    res.json({
      email: invitation.email,
      role: invitation.role,
      message: invitation.message,
      invitedBy: invitation.invitedBy,
      expiresAt: invitation.expiresAt
    });
  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept invitation and create account
router.post('/:token/accept', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, password } = req.body;

    // Find and validate invitation
    const invitation = await Invitation.findOne({
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or expired' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email: invitation.email,
      password,
      role: invitation.role,
      status: 'online'
    });

    await user.save();

    // Mark invitation as accepted
    invitation.status = 'accepted';
    await invitation.save();

    // Generate JWT token
    const { generateToken: generateJWT } = await import('../utils/generateToken.js');
    const token = generateJWT(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Server error while creating account' });
  }
});

// Get all invitations (for admin/managers)
router.get('/', auth, async (req, res) => {
  try {
    const invitations = await Invitation.find({ invitedBy: req.userId })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel invitation
router.delete('/:id', auth, async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      _id: req.params.id,
      invitedBy: req.userId
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    await Invitation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;