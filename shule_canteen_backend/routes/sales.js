const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../config/firebase');
const { poolPromise } = require('../config/legacyDb'); // Change to promise version

// routes/sales.js
router.post('/process', async (req, res) => {
    try {
        const { 
            studentId, 
            studentName, 
            studentCode, 
            studentClass, 
            amount, 
            schoolCode, 
            items, 
            saleId, 
            operatorName 
        } = req.body;

        // 1. Deduct balance from student's wallet in MySQL using promise pool
        const [result] = await poolPromise.query(
            `UPDATE parent_shulecard_wallets w 
             JOIN students s ON s.id = w.student_id
             SET w.balance_rwf = w.balance_rwf - ?
             WHERE s.id = ? AND w.balance_rwf >= ?`,
            [amount, studentId, amount]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient balance or student not found' 
            });
        }

        // 2. Get updated balance
        const [balanceResult] = await poolPromise.query(
            `SELECT w.balance_rwf as balance 
             FROM parent_shulecard_wallets w 
             JOIN students s ON s.id = w.student_id
             WHERE s.id = ?`,
            [studentId]
        );
        
        const newBalance = balanceResult[0]?.balance || 0;

        // 3. Send notification to parent (SMS/Push)
        console.log(`📧 Parent notification for student ${studentName}:`);
        console.log(`   Amount spent: RWF ${amount}`);
        console.log(`   New balance: RWF ${newBalance}`);
        console.log(`   Items: ${items.map(i => `${i.name} x${i.quantity}`).join(', ')}`);
        console.log(`   Operator: ${operatorName}`);
        console.log(`   School: ${schoolCode}`);

        res.json({ 
            success: true, 
            message: 'Sale processed successfully',
            newBalance: newBalance
        });

    } catch (error) {
        console.error('Sale processing error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

module.exports = router;