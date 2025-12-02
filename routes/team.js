import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Invitation from '../models/Invitation.js';
import { auth } from '../middleware/auth.js';
import { sendInvitationEmail } from '../utils/emailService.js';

const router = express.Router();

// Get team members
router.get('/', auth, async (req, res) => {
  try {
    // Get projects where user is owner or member
    const userProjects = await Project.find({
      $or: [
        { owner: req.userId },
        { teamMembers: req.userId }
      ]
    }).populate('teamMembers');

    // Collect all unique team member IDs
    const teamMemberIds = new Set();
    userProjects.forEach(project => {
      teamMemberIds.add(project.owner.toString());
      project.teamMembers.forEach(member => {
        teamMemberIds.add(member._id.toString());
      });
    });

    // Get all team members
    const teamMembers = await User.find({
      _id: { $in: Array.from(teamMemberIds) }
    }).select('-password');

    res.json(teamMembers);
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team member by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send team invitation
router.post('/invite', auth, [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('role').isIn(['admin', 'project-manager', 'developer', 'designer', 'qa', 'viewer']).withMessage('Invalid role'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message too long')
], async (req, res) => {
  try {
    console.log('📧 Team invitation request received');
    console.log('📧 Request body:', req.body);
    console.log('📧 User ID:', req.userId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role, message } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({ 
      email, 
      status: 'pending' 
    });
    
    if (existingInvitation) {
      console.log('❌ Invitation already exists:', email);
      return res.status(400).json({ message: 'Invitation already sent to this email' });
    }

    // Get inviter details
    const inviter = await User.findById(req.userId).select('name email');
    if (!inviter) {
      console.log('❌ Inviter not found:', req.userId);
      return res.status(404).json({ message: 'Inviter not found' });
    }

    console.log('✅ Inviter found:', inviter.name, inviter.email);

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    console.log('🔑 Generated token:', token);
    console.log('⏰ Expires at:', expiresAt);

    // Create invitation
    const invitation = new Invitation({
      email,
      role,
      message,
      token,
      invitedBy: req.userId,
      expiresAt,
      status: 'pending'
    });

    await invitation.save();
    console.log('✅ Invitation saved to database');

    // Send invitation email
    try {
      console.log('📧 Attempting to send invitation email...');
      await sendInvitationEmail({
        to: email,
        inviterName: inviter.name,
        inviterEmail: inviter.email,
        role,
        message,
        token,
        invitationUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/join/${token}`
      });

      console.log('✅ Invitation email sent successfully');

      res.status(201).json({
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation._id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          createdAt: invitation.createdAt,
          expiresAt: invitation.expiresAt
        }
      });
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      
      // Delete the invitation if email failed
      await Invitation.findByIdAndDelete(invitation._id);
      console.log('🗑️ Deleted invitation due to email failure');
      
      res.status(500).json({ 
        message: 'Failed to send invitation email. Please try again.',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('❌ Send invitation error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get invitation details
router.get('/invitation/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('🔍 Looking up invitation with token:', token);

    const invitation = await Invitation.findOne({ 
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('invitedBy', 'name email');

    if (!invitation) {
      console.log('❌ Invitation not found or expired');
      return res.status(404).json({ 
        message: 'Invitation not found or has expired' 
      });
    }

    console.log('✅ Invitation found:', invitation.email);

    res.json({
      email: invitation.email,
      role: invitation.role,
      message: invitation.message,
      inviterName: invitation.invitedBy.name,
      inviterEmail: invitation.invitedBy.email,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt
    });
  } catch (error) {
    console.error('❌ Get invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept invitation and create account
router.post('/accept-invitation/:token', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    console.log('🎯 Accept invitation request received');
    console.log('🔑 Token:', req.params.token);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { name, password } = req.body;

    // Find and validate invitation
    const invitation = await Invitation.findOne({ 
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      console.log('❌ Invitation not found or expired');
      return res.status(404).json({ 
        message: 'Invitation not found or has expired' 
      });
    }

    console.log('✅ Valid invitation found for:', invitation.email);

    // Check if user already exists
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      console.log('❌ User already exists:', invitation.email);
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
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
    console.log('✅ User created successfully:', user.email);

    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();
    console.log('✅ Invitation marked as accepted');

    // Generate JWT token
    const { generateToken } = await import('../utils/generateToken.js');
    const authToken = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token: authToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ Accept invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend invitation
router.post('/resend-invitation/:id', auth, async (req, res) => {
  try {
    console.log('🔄 Resend invitation request for ID:', req.params.id);

    const invitation = await Invitation.findById(req.params.id);
    
    if (!invitation) {
      console.log('❌ Invitation not found');
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.invitedBy.toString() !== req.userId) {
      console.log('❌ Access denied - not the inviter');
      return res.status(403).json({ message: 'Access denied' });
    }

    if (invitation.status !== 'pending') {
      console.log('❌ Invitation is no longer pending');
      return res.status(400).json({ message: 'Invitation is no longer pending' });
    }

    // Generate new token and extend expiry
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    invitation.token = token;
    invitation.expiresAt = expiresAt;
    await invitation.save();

    console.log('✅ Invitation updated with new token');

    // Get inviter details
    const inviter = await User.findById(req.userId).select('name email');

    // Resend invitation email
    try {
      await sendInvitationEmail({
        to: invitation.email,
        inviterName: inviter.name,
        inviterEmail: inviter.email,
        role: invitation.role,
        message: invitation.message,
        token,
        invitationUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/join/${token}`
      });

      console.log('✅ Invitation resent successfully');
      res.json({ message: 'Invitation resent successfully' });
    } catch (emailError) {
      console.error('❌ Email resending error:', emailError);
      res.status(500).json({ 
        message: 'Failed to resend invitation email' 
      });
    }
  } catch (error) {
    console.error('❌ Resend invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove/cancel invitation
router.delete('/invitation/:id', auth, async (req, res) => {
  try {
    console.log('🗑️ Remove invitation request for ID:', req.params.id);

    const invitation = await Invitation.findById(req.params.id);
    
    if (!invitation) {
      console.log('❌ Invitation not found');
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.invitedBy.toString() !== req.userId) {
      console.log('❌ Access denied - not the inviter');
      return res.status(403).json({ message: 'Access denied' });
    }

    await Invitation.findByIdAndDelete(req.params.id);
    console.log('✅ Invitation deleted successfully');

    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('❌ Remove invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team member status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'busy'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Users can only update their own status
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: 'Can only update your own status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, lastActive: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;