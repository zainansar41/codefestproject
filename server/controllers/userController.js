import User from "../models/Users.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // For email sending

import { transporter, mailOptions } from './mail.js'; // Ensure this is correct

export const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log("req.body ", req.body);

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User already exists:", existingUser);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log("Password hashed successfully");

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
        console.log("User saved successfully");

        // Generate JWT for email verification
        const token = jwt.sign({ userId: newUser._id }, 'secretkey', { expiresIn: '1d' });
        console.log("Token generated:", token);

        // Uncomment email sending code to verify email
        const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;
        const verificationMailOptions = {
            from: mailOptions.from,
            to: email,
            subject: 'Email Verification',
            text: `Please verify your email by clicking the link: ${verificationUrl}`,
        };

        // Send verification email
        transporter.sendMail(verificationMailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(400).json({ message: 'Error sending email' });
            }
            console.log('Email sent: ' + info.response);
        });

        res.status(201).json({ message: 'User registered successfully. Please verify your email.', success: true, token });
    } catch (error) {
        console.error("Error in registration:", error); // Log the full error
        res.status(500).json({ message: 'Something went wrong', error: error.message }); // Send the error message to help identify the problem
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
        const token = jwt.sign({ userId: existingUser._id, role: existingUser.role }, 'secretkey', { expiresIn: '1d' });

        res.status(200).json({ result: existingUser, token, success: true });
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

        res.status(200).json({ message: 'Email verified successfully', success: true, user });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

// Start Time Session
export const startTimeSession = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD

        // Find if there's an ongoing session for today (entry with no endTime)
        let ongoingSession = user.timeSpentPerDay.find(entry =>
            entry.date.toISOString().slice(0, 10) === today && !entry.endTime
        );

        if (ongoingSession) {
            return res.status(400).json({ message: 'You already have an ongoing session. Please stop it before starting a new one.' });
        }

        // Add a new entry for the current time session
        user.timeSpentPerDay.push({
            date: new Date(),
            startTime: new Date(), // Set the current time as the start time
            timeSpent: 0 // Start with 0 time spent for the new session
        });

        await user.save();

        res.status(200).json({ message: 'Time session started successfully', success: true });
    } catch (error) {
        console.error('Error starting time session:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

// Stop Time Session
export const stopTimeSession = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD

        // Find ongoing session for today
        let ongoingSession = user.timeSpentPerDay.find(entry =>
            new Date(entry.date).toISOString().slice(0, 10) === today && !entry.endTime
        );

        if (!ongoingSession) {
            return res.status(400).json({ message: 'No ongoing session found for today.' });
        }

        // Set the end time for this session
        ongoingSession.endTime = new Date();

        // Ensure timeSpent is initialized
        if (!ongoingSession.timeSpent) {
            ongoingSession.timeSpent = 0;
        }

        // Calculate time spent for this session
        const timeSpentInSeconds = (new Date(ongoingSession.endTime) - new Date(ongoingSession.startTime)) / 1000;

        // Add the time spent to the session
        ongoingSession.timeSpent += timeSpentInSeconds;

        // Save the user data
        await user.save();

        res.status(200).json({
            message: 'Time session stopped successfully',
            success: true,
            timeSpent: ongoingSession.timeSpent
        });
    } catch (error) {
        console.error('Error stopping time session:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

export const getUserByID = async (req, res)=>{
    try {
        const {id} = req.params;

        const user = await User.findById(id);
        console.log(user);
        

        res.status(200).json({ message: 'Time session stopped successfully', success: true,user});
        
    } catch (error) {
        console.error('Error stopping time session:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
}