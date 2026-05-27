const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

const generateTempPassword = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateSupplierId = () => `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
router.post('/register', async (req, res) => {
    try {
        const {
            businessName, category, tinNumber, contactPerson,
            phone, email, province, district, logoUrl
        } = req.body;

        const supplierId = generateSupplierId();

        const supplierData = {
            id: supplierId,
            supplierCode: supplierId,
            companyName: businessName,
            category,
            tinNumber,
            contactPerson,
            phone,
            email,
            province,
            district,
            logoUrl: logoUrl || '',
            status: 'pending',
            entityType: 'supplier',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.collection('suppliers').doc(supplierId).set(supplierData);

        res.status(201).json({
            success: true,
            message: 'Registration submitted',
            supplierId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.post('/approve', async (req, res) => {
    const { supplierId } = req.body;

    try {
        const supplierDoc = await db.collection('suppliers').doc(supplierId).get();
        if (!supplierDoc.exists) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }

        const supplier = supplierDoc.data();
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create user account
        const userId = `USR-${Date.now()}`;
        await db.collection('users').doc(userId).set({
            id: userId,
            fullName: supplier.contactPerson,
            phone: supplier.phone,
            email: supplier.email,
            role: 'supplier',
            supplierId: supplierId,
            supplierName: supplier.companyName,
            password: hashedPassword,
            tempPassword: tempPassword,
            status: 'active',
            createdAt: new Date().toISOString()
        });

        // Update supplier
        await db.collection('suppliers').doc(supplierId).update({
            status: 'active',
            approvedAt: new Date().toISOString(),
            userId: userId
        });

        res.json({
            success: true,
            message: 'Supplier approved',
            account: { email: supplier.email, phone: supplier.phone, tempPassword }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers
 */
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('suppliers').get();
        const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, suppliers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/supplier/:id
 * @desc    Get single supplier
 */
router.get('/:id', async (req, res) => {
    try {
        const doc = await db.collection('suppliers').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, supplier: { id: doc.id, ...doc.data() } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;