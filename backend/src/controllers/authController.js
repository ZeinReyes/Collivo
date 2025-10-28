import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

// 📩 Helper to send emails
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 🔹 REGISTER with email verification
export const register = async (req, res) => {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password)
        return res.status(400).json({ message: 'All fields are required.' });

    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Email already exists.' });

        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ message: 'Username already exists.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
            emailVerificationCode: verificationCode,
            emailVerificationExpiry: Date.now() + 10 * 60 * 1000 // 10 mins
        });

        await newUser.save();

        // Send verification email
        await transporter.sendMail({
            from: '"Collivo" <no-reply@collivo.com>',
            to: email,
            subject: "Verify Your Email - Collivo",
            html: `
                <div style="font-family:sans-serif;">
                    <h2>Welcome to Collivo!</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color:#00264C;">${verificationCode}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `
        });

        res.status(201).json({
            message: 'Registration successful. Please verify your email.',
            redirect: '/verify-email',
            userId: newUser._id
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 🔹 VERIFY EMAIL (by email instead of userId)
export const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    try {
        // Check if user exists by email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Already verified
        if (user.isEmailVerified)
            return res.status(400).json({ message: 'Email already verified' });

        // Code mismatch
        if (user.emailVerificationCode !== code)
            return res.status(400).json({ message: 'Invalid verification code' });

        // Expired code
        if (user.emailVerificationExpiry < Date.now())
            return res.status(400).json({ message: 'Verification code expired' });

        // ✅ Mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpiry = undefined;
        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Email verified successfully!',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 🔹 LOGIN (check if verified)
export const login = async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    try {
        const user = usernameOrEmail.includes('@')
            ? await User.findOne({ email: usernameOrEmail })
            : await User.findOne({ username: usernameOrEmail });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid credentials' });

        if (!user.isEmailVerified)
            return res.status(403).json({
                message: 'Email not verified. Redirecting to verification page.',
                redirect: '/verify-email',
                userId: user._id
            });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 🔹 RESEND VERIFICATION CODE
export const resendVerification = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isEmailVerified)
            return res.status(400).json({ message: 'Email already verified' });

        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationCode = newCode;
        user.emailVerificationExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        await transporter.sendMail({
            from: '"Collivo" <no-reply@collivo.com>',
            to: user.email,
            subject: 'New Email Verification Code',
            html: `
                <div style="font-family:sans-serif;">
                    <h2>New Verification Code</h2>
                    <h1 style="color:#00264C;">${newCode}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `
        });

        res.json({ message: 'New verification code sent' });
    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const forgotPassword = async (req, res) => {
    const {email} = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpiry = Date.now() + 3600000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetLink = `http://localhost:3000/reset-password/${token}`;

        await transporter.sendMail({
            from: '"Collivo" <your-email@gmail.com>',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                color: #333;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 20px;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                background-color: #fff;
                                padding: 30px;
                                border-radius: 8px;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            }
                            .header {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .header h2 {
                                color: #00264C;
                                font-size: 24px;
                            }
                            .content {
                                font-size: 16px;
                                line-height: 1.5;
                                color: #555;
                            }
                            .content p {
                                margin-bottom: 15px;
                            }
                            .button {
                                display: inline-block;
                                background-color: #00264C;
                                color: white;
                                padding: 12px 25px;
                                font-size: 16px;
                                text-decoration: none;
                                border-radius: 4px;
                                text-align: center;
                                margin: 20px 0;
                                transition: background-color 0.3s;
                            }
                            .button:hover {
                                background-color: #004d80;
                            }
                            .footer {
                                text-align: center;
                                font-size: 14px;
                                color: #777;
                                margin-top: 30px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>Password Reset Request</h2>
                            </div>
                            <div class="content">
                                <p>Hi there,</p>
                                <p>We received a request to reset your password for your Collivo account.</p>
                                <p>If you did not request this, please ignore this email. Otherwise, click the button below to reset your password.</p>
                                <a href="${resetLink}" class="button">Reset Password</a>
                                <p>This link will expire in 1 hour.</p>
                            </div>
                            <div class="footer">
                                <p>Thank you for using Collivo! If you have any questions, feel free to contact our support team.</p>
                            </div>
                        </div>
                    </body>
                </html>
            `,
        });     
        res.json({ message: 'Password reset link sent to your email' });   
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};