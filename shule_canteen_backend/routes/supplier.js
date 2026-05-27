const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

// Helper functions
const generateTempPassword = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateSupplierId = () => `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
/**
 * @route   POST /api/supplier/provision-staff
 * @desc    Provision staff accounts for a supplier
 */
router.post('/provision-staff', async (req, res) => {
    const { supplierId, staffList } = req.body;

    if (!supplierId || !Array.isArray(staffList)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request data'
        });
    }

    try {
        // Get supplier details
        const supplierDoc = await db.collection('onboarding_requests').doc(supplierId).get();
        if (!supplierDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        const supplier = supplierDoc.data();
        const results = [];

        // Provision each staff member
        for (const staff of staffList) {
            const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            const userId = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const userData = {
                id: userId,
                fullName: staff.name,
                phone: staff.phone,
                email: staff.email || '',
                role: staff.role.toLowerCase(),
                supplierId: supplierId,
                supplierName: supplier.companyName || supplier.businessName,
                password: hashedPassword,
                tempPassword: tempPassword,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await db.collection('users').doc(userId).set(userData);

            results.push({
                id: userId,
                name: staff.name,
                role: staff.role.toLowerCase(),
                phone: staff.phone,
                tempPassword: tempPassword
            });
        }

        return res.json({
            success: true,
            message: `Successfully provisioned ${results.length} accounts`,
            accounts: results
        });

    } catch (error) {
        console.error('Supplier Staff Provisioning Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to provision staff',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/supplier/register
 * @desc    Register new supplier
 */
router.post('/register', async (req, res) => {
    try {
        const {
            businessName,
            category,
            tinNumber,
            contactPerson,
            phone,
            email,
            province,
            district,
            logoUrl
        } = req.body;

        const supplierId = generateSupplierId();

        // Create supplier document in 'suppliers' collection
        const supplierData = {
            id: supplierId,
            supplierCode: supplierId,
            companyName: businessName,
            businessName: businessName,
            category: category,
            tinNumber: tinNumber,
            contactPerson: contactPerson,
            phone: phone,
            email: email,
            province: province,
            district: district,
            logoUrl: logoUrl || '',
            status: 'pending', // pending -> active (when admin approves)
            entityType: 'supplier',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.collection('suppliers').doc(supplierId).set(supplierData);

        // Also save to onboarding_requests for tracking
        await db.collection('onboarding_requests').doc(supplierId).set({
            ...supplierData,
            source: 'supplier_onboarding'
        });

        res.status(201).json({
            success: true,
            message: 'Supplier registration submitted successfully. Awaiting approval.',
            supplierId: supplierId
        });
    } catch (error) {
        console.error('Supplier Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/supplier/approve
 * @desc    Approve supplier and create user account
 */
router.post('/approve', async (req, res) => {
    const { supplierId } = req.body;

    if (!supplierId) {
        return res.status(400).json({
            success: false,
            message: 'Supplier ID required'
        });
    }

    try {
        const supplierDoc = await db.collection('suppliers').doc(supplierId).get();
        if (!supplierDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        const supplier = supplierDoc.data();
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create user account for supplier contact person
        const userId = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const userData = {
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.collection('users').doc(userId).set(userData);

        // Update supplier status
        await db.collection('suppliers').doc(supplierId).update({
            status: 'active',
            approvedAt: new Date().toISOString(),
            userId: userId,
            updatedAt: new Date().toISOString()
        });

        // Update onboarding request
        await db.collection('onboarding_requests').doc(supplierId).update({
            status: 'active',
            approvedAt: new Date().toISOString(),
            userId: userId
        });

        res.json({
            success: true,
            message: 'Supplier approved and account created',
            account: {
                userId: userId,
                email: supplier.email,
                phone: supplier.phone,
                tempPassword: tempPassword
            }
        });
    } catch (error) {
        console.error('Supplier Approval Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve supplier',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers (with optional status filter)
 */
router.get('/', async (req, res) => {
    const { status } = req.query;

    try {
        let query = db.collection('suppliers');
        
        if (status) {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.get();
        const suppliers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            success: true,
            suppliers: suppliers
        });
    } catch (error) {
        console.error('Fetch Suppliers Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch suppliers',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/supplier/:supplierId
 * @desc    Get single supplier details
 */
router.get('/:supplierId', async (req, res) => {
    const { supplierId } = req.params;

    try {
        const supplierDoc = await db.collection('suppliers').doc(supplierId).get();
        
        if (!supplierDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.json({
            success: true,
            supplier: {
                id: supplierDoc.id,
                ...supplierDoc.data()
            }
        });
    } catch (error) {
        console.error('Fetch Supplier Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch supplier',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/supplier/:supplierId
 * @desc    Update supplier information
 */
router.put('/:supplierId', async (req, res) => {
    const { supplierId } = req.params;
    const updateData = req.body;

    try {
        const supplierRef = db.collection('suppliers').doc(supplierId);
        const supplierDoc = await supplierRef.get();

        if (!supplierDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        await supplierRef.update({
            ...updateData,
            updatedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Supplier updated successfully'
        });
    } catch (error) {
        console.error('Update Supplier Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update supplier',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/supplier/:supplierId
 * @desc    Delete/suspend supplier
 */
router.delete('/:supplierId', async (req, res) => {
    const { supplierId } = req.params;

    try {
        const supplierRef = db.collection('suppliers').doc(supplierId);
        const supplierDoc = await supplierRef.get();

        if (!supplierDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        // Soft delete - just update status
        await supplierRef.update({
            status: 'suspended',
            suspendedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Supplier suspended successfully'
        });
    } catch (error) {
        console.error('Delete Supplier Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to suspend supplier',
            error: error.message
        });
    }
});

module.exports = router;