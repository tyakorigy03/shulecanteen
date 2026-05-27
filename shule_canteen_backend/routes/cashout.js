const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../config/firebase');

/**
 * @route   POST /api/cashout/request
 * @desc    Submit a cashout request for a canteen
 * @access  Private (Canteen Admin/Operator)
 */
router.post('/request', auth, async (req, res) => {
    const { amount, method, canteenId, schoolCode } = req.body;

    if (!amount || !method || !canteenId) {
        return res.status(400).json({ success: false, message: 'Missing required cashout data' });
    }

    try {
        // 1. Create the request document in Firestore
        const requestData = {
            canteenId,
            schoolCode: schoolCode || '',
            amount: parseFloat(amount),
            method,
            status: 'pending',
            operatorId: req.user.uid,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('cashout_requests').add(requestData);

        // --- CUSTOM LOGIC PLACEHOLDER ---
        // TODO: Add logic here to notify the school individual in charge.
        // For example: Send an email, SMS, or push notification.
        console.log(`[CASHOUT] New request from ${canteenId} for RWF ${amount}. Notification logic should go here.`);
        // --- END PLACEHOLDER ---

        res.json({
            success: true,
            message: 'Cashout request submitted successfully',
            requestId: docRef.id
        });

    } catch (error) {
        console.error('Cashout Request Error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit request', error: error.message });
    }
});

/**
 * @route   GET /api/cashout/balance/:canteenId
 * @desc    Calculate available balance for a canteen
 * @access  Private
 */
router.get('/balance/:canteenId', auth, async (req, res) => {
    try {
        // Simple aggregation: Sum totalAmount of all sales for this canteen
        const salesSnap = await db.collection('sales')
            .where('canteenId', '==', req.params.canteenId)
            .get();

        let totalSales = 0;
        salesSnap.forEach(doc => {
            totalSales += doc.data().totalAmount || 0;
        });

        // Subtract successful/pending cashouts
        const cashoutSnap = await db.collection('cashout_requests')
            .where('canteenId', '==', req.params.canteenId)
            .where('status', 'in', ['pending', 'completed'])
            .get();

        let totalCashouts = 0;
        cashoutSnap.forEach(doc => {
            totalCashouts += doc.data().amount || 0;
        });

        const availableBalance = totalSales - totalCashouts;

        res.json({ success: true, balance: availableBalance });
    } catch (error) {
        console.error('Balance Calculation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to calculate balance' });
    }
});

/**
 * @route   GET /api/cashout/history/:canteenId
 * @desc    Get cashout history for a canteen
 * @access  Private
 */
router.get('/history/:canteenId', auth, async (req, res) => {
    try {
        const snapshot = await db.collection('cashout_requests')
            .where('canteenId', '==', req.params.canteenId)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json({ success: true, history });
    } catch (error) {
        console.error('Cashout History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
});

module.exports = router;
