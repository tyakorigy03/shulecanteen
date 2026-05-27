require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('./config/firebase');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Import Routes
const registrationRoutes = require('./routes/registration');
const authRoutes = require('./routes/auth');
const canteenRoutes = require('./routes/canteen');
const cashoutRoutes = require('./routes/cashout');
const supplierRoutes = require('./routes/supplier');
const imageRoutes = require('./routes/image');
const driverRoutes = require('./routes/driverRoutes');
const salesRoutes = require('./routes/sales');


// Middleware
app.use(cors());
app.use(express.json());

//uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount Routes
app.use('/api/register', registrationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/cashout', cashoutRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/sales', salesRoutes);


// Heartbeat Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        message: 'Shule Canteen Backend is operational',
        timestamp: new Date().toISOString()
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`
🚀 SHULE CANTEEN BACKEND STARTED
-------------------------------
Port: ${PORT}
Node Version: ${process.version}
-------------------------------
    `);
});
