const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// REGISTER API
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, className } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters.'
            });
        }

        if (!['student', 'teacher'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid account role.'
            });
        }

        if (
            role === 'student' &&
            !['Class 8', 'Class 9', 'Class 10'].includes(className)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid class.'
            });
        }

        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            className: role === 'student' ? className : null
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                className: user.className
            }
        });

    } catch (error) {
        console.error('Registration error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Registration failed.'
        });
    }
});

// LOGIN API
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Email, password and role are required.'
            });
        }

        if (!['student', 'teacher'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid account role.'
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            role
        });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                className: user.className
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Login failed.'
        });
    }
});

// TEACHER: Get all registered students
router.get('/students', protect, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({
                success: false,
                message: 'Only teachers can view students.'
            });
        }

        const students = await User.find({
            role: 'student'
        })
            .select('name email className createdAt')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            students
        });

    } catch (error) {
        console.error('Student fetch error:', error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Export router
module.exports = router;