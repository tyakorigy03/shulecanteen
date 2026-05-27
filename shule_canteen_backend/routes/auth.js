const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    try {
        // Find user by phone
        const userSnapshot = await db.collection('users')
            .where('phone', '==', phone)
            .get();

        if (userSnapshot.empty) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create JWT Payload
        const payload = {
            user: {
                id: userDoc.id,
                role: user.role,
                name: user.fullName
            }
        };

        // Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '2400h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token,
                    user: {
                        id: userDoc.id,
                        name: user.fullName,
                        phone: user.phone,
                        role: user.role,
                        email: user.email,
                        profilePicture: user?.profilePicture || '',
                        ... (user.schoolCode ? { schoolCode: user.schoolCode } : {}),
                        ... (user.supplierId ? { supplierId: user.supplierId } : {})
                    }
                });
            }
        );

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
