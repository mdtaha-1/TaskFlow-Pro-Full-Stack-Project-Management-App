import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import EmailVerification from '../models/EmailVerification.js';
import { generateToken, sendEmail, emailTemplates } from '../utils/emailService.js';

const router = express.Router();

// Send verification email
router.post('/send', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified (in a real app, you'd have an isVerified field)
    // For demo purposes, we'll always allow sending verification

    // Delete any existing verification tokens
    await EmailVerification.deleteMany({ user: user._id });

    // Generate verification token
    const token = generateToken();

    // Create verification record
    const verification = new EmailVerification({
      user: user._id,
      token
    });

    await verification.save();

    // Create verification link
    const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;

    // Send verification email
    const emailTemplate = emailTemplates.emailVerification(user.name, verificationLink);
    await sendEmail(email, emailTemplate);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ message: 'Server error while sending verification email' });
  }
});

// Verify email
router.post('/verify/:token', async (req, res) => {
  try {
    // Find verification record
    const verification = await EmailVerification.findOne({
      token: req.params.token,
      expiresAt: { $gt: new Date() }
    }).populate('user');

    if (!verification) {
      return res.status(404).json({ message: 'Verification token not found or expired' });
    }

    // In a real app, you'd update the user's isVerified field
    // For demo purposes, we'll just delete the verification record
    await EmailVerification.findByIdAndDelete(verification._id);

    res.json({ 
      message: 'Email verified successfully',
      user: verification.user
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error while verifying email' });
  }
});

export default router;