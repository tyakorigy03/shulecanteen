const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, admin } = require('../config/firebase');
const { poolPromise: pool } = require('../config/legacyDb');

// Helper to generate a random temporary password (6-digit numeric pin)
const generateTempPassword = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @route   POST /api/canteen/connect
 * @desc    Validate school code against legacy DB and link it
 */
router.post('/connect', async (req, res) => {
    const { schoolCode, canteenId } = req.body;

    if (!schoolCode || !canteenId) {
        return res.status(400).json({ success: false, message: 'Missing schoolCode or canteenId' });
    }

    try {
        // 1. Query legacy DB for school
        const [schools] = await pool.query(
            'SELECT * FROM schools WHERE school_code = ?',
            [schoolCode]
        );

        if (schools.length === 0) {
            return res.status(404).json({ success: false, message: 'School code not found in legacy system' });
        }

        const legacySchool = schools[0];

        // 2. Fetch additional metadata from school_babyeyi if available
        const [babyeyiInfo] = await pool.query(
            'SELECT * FROM school_babyeyi WHERE school_id = ? LIMIT 1',
            [legacySchool.id]
        );

        const schoolData = {
            legacyId: legacySchool.id,
            schoolName: legacySchool.school_name,
            schoolCode: legacySchool.school_code,
            location: {
                province: legacySchool.province,
                district: legacySchool.district,
                sector: legacySchool.sector
            },
            email: legacySchool.email,
            phone: legacySchool.phone,
            connectedAt: new Date().toISOString(),
            status: 'connected',
            babyeyiMeta: babyeyiInfo.length > 0 ? {
                category: babyeyiInfo[0].school_category,
                level: babyeyiInfo[0].education_level
            } : null
        };

        // We link the canteen onboarding/management record to this school code

        // Also update the original onboarding request status if canteenId is provided
        await db.collection('onboarding_requests').doc(canteenId).update({
            schoolCode: schoolCode,
            isLive: true,
            connectedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Successfully connected to legacy school',
            school: schoolData
        });

    } catch (error) {
        console.error('Connect Error:', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
});

/**
 * @route   POST /api/canteen/sync
 * @desc    Fetch students and wallets from legacy and store as ONE document in Firestore
 */
router.post('/sync', async (req, res) => {
    const { schoolCode } = req.body;

    if (!schoolCode) {
        return res.status(400).json({
            success: false,
            message: 'Missing schoolCode'
        });
    }

    try {
        // 1. Get full school data
        const [schoolCheck] = await pool.query(
            'SELECT * FROM schools WHERE school_code = ?',
            [schoolCode]
        );

        if (schoolCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'School not found'
            });
        }

        const school = schoolCheck[0];

        const schoolIdentity = {
            id: school.id,
            code: school.school_code,
            name: school.school_name,
            phone: school.phone,
            email: school.email,
            address: school.full_address,
            district: school.district,
            province: school.province,
            logo: school.logo_url
        };

        // 2. Fetch students
        const [students] = await pool.query(`
            SELECT 
                s.id as legacyId,
                s.student_code as studentCode,
                s.rfid_uid,
                s.first_name,
                s.last_name,
                s.student_photo,
                s.class_name as className,
                w.balance_rwf as balance
            FROM students s
            LEFT JOIN parent_shulecard_wallets w 
                ON s.id = w.student_id
            WHERE s.school_id = ?
        `, [school.id]);

        // 3. Transform
        const studentList = students.map(s => ({
            id: s.legacyId,
            code: s.studentCode,
            rfidUid: s.rfid_uid,
            name: `${s.first_name} ${s.last_name}`,
            class: s.className,
            balance: parseFloat(s.balance || 0)
        }));

        // 4. Write to Firestore
        await db.collection('schools')
            .doc(schoolCode)
            .collection('data')
            .doc('students_manifest')
            .set({
                school: schoolIdentity,
                lastSync: new Date().toISOString(),
                count: studentList.length,
                students: studentList
            });

        return res.json({
            success: true,
            message: `Synced ${studentList.length} students successfully`,
            count: studentList.length
        });

    } catch (error) {
        console.error('Sync Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Sync failed',
            error: error.message
        });
    }
});


/**
 * @route   POST /api/canteen/provision-staff
 * @desc    Create multiple staff accounts for a school
 */
router.post('/provision-staff', async (req, res) => {
    const { schoolCode, staffList } = req.body;

    if (!schoolCode || !Array.isArray(staffList)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request data'
        });
    }

    try {
        // 1. Resolve school identity
        const [schoolRows] = await pool.query(
            'SELECT id, school_code, school_name FROM schools WHERE school_code = ?',
            [schoolCode]
        );

        if (schoolRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'School not found'
            });
        }

        const school = schoolRows[0];

        const results = [];

        // 2. Provision staff
        for (const staff of staffList) {
            const tempPassword = generateTempPassword();
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            const operatorData = {
                fullName: staff.name,
                phone: staff.phone,
                email: staff.email || '',
                role: staff.role.toLowerCase(),
                schoolId: school.id,
                schoolCode: school.school_code,
                schoolName: school.school_name,
                password: hashedPassword,
                createdAt: new Date().toISOString(),
                tempPassword 
            };

            const userRef = await db.collection('users').add(operatorData);

            results.push({
                id: userRef.id,
                name: staff.name,
                role: staff.role.toLowerCase(),
                phone: staff.phone,
                tempPassword
            });
        }

        return res.json({
            success: true,
            message: `Successfully provisioned ${results.length} accounts`,
            school: {
                id: school.id,
                code: school.school_code,
                name: school.school_name
            },
            accounts: results
        });

    } catch (error) {
        console.error('Staff Provisioning Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to provision staff',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/canteen/configure-operator
 * @desc    Create a single operator account for a school
 */
router.post('/configure-operator', async (req, res) => {
    const { fullName, phone, email, role, schoolCode } = req.body;

    if (!fullName || !phone || !schoolCode) {
        return res.status(400).json({ success: false, message: 'Missing required operator data' });
    }

    try {
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const operatorData = {
            fullName,
            phone,
            email: email || '',
            password: hashedPassword,
            role: (role || 'operator').toLowerCase(),
            schoolCode,
            createdAt: new Date().toISOString(),
            tempPassword
        };

        const userRef = await db.collection('users').add(operatorData);

        res.json({
            success: true,
            message: 'Operator account created',
            operator: {
                id: userRef.id,
                fullName,
                phone,
                role: operatorData.role,
                tempPassword
            }
        });

    } catch (error) {
        console.error('Configure Operator Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create operator', error: error.message });
    }
});
/**
 * @route   POST /api/canteen/deduct-balance
 * @desc    Deduct student balance in MySQL
 */
router.post('/deduct-balance', async (req, res) => {
    const { studentId, amount, schoolCode } = req.body;

    if (!studentId || !amount) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Update student wallet in MySQL
        const [result] = await pool.query(
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

        res.json({ success: true, message: 'Balance updated successfully' });
    } catch (error) {
        console.error('Balance deduction error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * @route   GET /api/canteen/schools
 * @desc    Fetch all registered schools from legacy directory
 */
router.get('/schools', async (req, res) => {
    try {
        const [schools] = await pool.query(
            'SELECT id, school_name as name, school_code as code, province, district, sector FROM schools ORDER BY school_name ASC'
        );
        res.json({ success: true, schools });
    } catch (error) {
        console.error('Fetch Schools Error:', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
});

/**
 * @route   GET /api/canteen/school-stats/:id
 * @desc    Get student count for a specific school
 */
router.get('/school-stats/:id', async (req, res) => {
    try {
        const [stats] = await pool.query(
            'SELECT COUNT(*) as count FROM students WHERE school_id = ?',
            [req.params.id]
        );
        res.json({ success: true, count: stats[0].count });
    } catch (error) {
        console.error('Fetch Stats Error:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

module.exports = router;
