const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

const generateTempPassword = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateDriverId = () => `DRV-${Math.floor(1000 + Math.random() * 9000)}`;

/**
 * @route   POST /api/driver/register
 * @desc    Register a new driver
 */
router.post('/register', async (req, res) => {
    try {
        const {
            fullName,
            phone,
            vehicleType,
            plateNumber,
            idNumber,
            supplierId  // Which supplier this driver works for
        } = req.body;

        const driverId = generateDriverId();
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create driver document
        const driverData = {
            id: driverId,
            driverCode: driverId,
            fullName,
            phone,
            vehicleType,
            plateNumber,
            idNumber,
            supplierId,
            status: 'active',
            isAvailable: true,
            currentLocation: null,
            currentDeliveryId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.collection('drivers').doc(driverId).set(driverData);

        // Create user account for driver
        const userId = `USR-${Date.now()}`;
        await db.collection('users').doc(userId).set({
            id: userId,
            fullName,
            phone,
            role: 'driver',
            driverId: driverId,
            supplierId: supplierId,
            password: hashedPassword,
            tempPassword: tempPassword,
            status: 'active',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Driver registered successfully',
            driverId: driverId,
            account: {
                phone,
                tempPassword
            }
        });
    } catch (error) {
        console.error('Driver Registration Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/drivers/supplier/:supplierId
 * @desc    Get all drivers for a supplier
 */
router.get('/supplier/:supplierId', async (req, res) => {
    try {
        const snapshot = await db.collection('drivers')
            .where('supplierId', '==', req.params.supplierId)
            .get();
        
        const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   PUT /api/driver/:driverId/location
 * @desc    Update driver's current location
 */
router.put('/:driverId/location', async (req, res) => {
    const { driverId } = req.params;
    const { lat, lng, address } = req.body;

    try {
        await db.collection('drivers').doc(driverId).update({
            currentLocation: { lat, lng, address, updatedAt: new Date().toISOString() },
            updatedAt: new Date().toISOString()
        });
        res.json({ success: true, message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /api/delivery/create
 * @desc    Create a delivery assignment (multiple orders to one destination)
 */
router.post('/delivery/create', async (req, res) => {
    try {
        const {
            driverId,
            orderIds,
            destination,
            destinationSchoolCode,
            estimatedArrival,
            notes
        } = req.body;

        const deliveryId = `DLV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const deliveryData = {
            id: deliveryId,
            driverId,
            orderIds,
            destination,
            destinationSchoolCode,
            estimatedArrival: new Date(estimatedArrival),
            status: 'assigned', // assigned, in_transit, delivered, cancelled
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.collection('deliveries').doc(deliveryId).set(deliveryData);

        // Update driver's current delivery
        await db.collection('drivers').doc(driverId).update({
            currentDeliveryId: deliveryId,
            isAvailable: false,
            updatedAt: new Date().toISOString()
        });

        // Update all orders with delivery info
        const batch = writeBatch(db);
        for (const orderId of orderIds) {
            const orderRef = doc(db, 'purchase_orders', orderId);
            batch.update(orderRef, {
                deliveryId: deliveryId,
                deliveryStatus: 'assigned',
                updatedAt: new Date().toISOString()
            });
        }
        await batch.commit();

        res.json({ success: true, deliveryId });
    } catch (error) {
        console.error('Delivery creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   PUT /api/delivery/:deliveryId/status
 * @desc    Update delivery status (driver updates)
 */
router.put('/delivery/:deliveryId/status', async (req, res) => {
    const { deliveryId } = req.params;
    const { status, location } = req.body;

    try {
        const updateData = {
            status,
            updatedAt: new Date().toISOString()
        };
        
        if (location) {
            updateData.currentLocation = location;
        }
        
        if (status === 'delivered') {
            updateData.deliveredAt = new Date().toISOString();
            
            // Update driver availability
            const delivery = await db.collection('deliveries').doc(deliveryId).get();
            if (delivery.exists) {
                await db.collection('drivers').doc(delivery.data().driverId).update({
                    currentDeliveryId: null,
                    isAvailable: true,
                    updatedAt: new Date().toISOString()
                });
            }
        }

        await db.collection('deliveries').doc(deliveryId).update(updateData);
        
        res.json({ success: true, message: `Delivery ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/deliveries/supplier/:supplierId
 * @desc    Get all deliveries for a supplier
 */
router.get('/deliveries/supplier/:supplierId', async (req, res) => {
    try {
        const snapshot = await db.collection('deliveries')
            .where('supplierId', '==', req.params.supplierId)
            .orderBy('createdAt', 'desc')
            .get();
        
        const deliveries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, deliveries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;