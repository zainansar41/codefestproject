import User from "../models/Users.js";

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // using nodemailer for email sending

import { transporter, mailOptions } from './mail.js'; // from mail.js

export const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            verified: false, // User is not verified initially
        });

        // Save user
        await newUser.save();

        // Generate JWT for email verification
        const token = jwt.sign({ userId: newUser._id }, 'secretkey', { expiresIn: '1h' });

        // Create email verification link
        const verificationUrl = `http://localhost:5000/verify-email?token=${token}`;

        // Email options
        const verificationMailOptions = {
            from: mailOptions.senderEmail,
            to: email,
            subject: 'Email Verification',
            text: `Please verify your email by clicking the link: ${verificationUrl}`,
        };

        // Send verification email
        transporter.sendMail(verificationMailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent: ' + info.response);
        });

        res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};



// Login User
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is verified
        if (!existingUser.verified) {
            return res.status(401).json({ message: 'Please verify your email before logging in.' });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token for the user
        const token = jwt.sign({ userId: existingUser._id, role: existingUser.role }, 'secretkey', { expiresIn: '1h' });

        res.status(200).json({ result: existingUser, token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};


// Verify Email
export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, 'secretkey');
        const userId = decoded.userId;

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.verified = true;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};
