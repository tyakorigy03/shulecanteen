const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads/products');
const publicDir = path.join(__dirname, '../public/uploads/products');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Configure multer storage (temporary)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|jfif|jfif-t|jfif-t/;  
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Single image upload handler
const uploadSingle = upload.single('image');

// Process and save image
const processAndSaveImage = async (file, supplierId) => {
    const uniqueId = uuidv4();
    const filename = `${supplierId}_${uniqueId}.webp`;
    const outputPath = path.join(publicDir, filename);
    
    // Process image with sharp
    await sharp(file.buffer)
        .resize(500, 500, { fit: 'cover', position: 'center' })
        .webp({ quality: 80 })
        .toFile(outputPath);
    
    // Return the public URL
    return `/uploads/products/${filename}`;
};

// Upload image endpoint
const uploadProductImage = async (req, res) => {
    try {
        uploadSingle(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No image file provided'
                });
            }
            
            const { supplierId } = req.body;
            if (!supplierId) {
                return res.status(400).json({
                    success: false,
                    message: 'Supplier ID is required'
                });
            }
            
            // Process and save image
            const imageUrl = await processAndSaveImage(req.file, supplierId);
            
            res.json({
                success: true,
                message: 'Image uploaded successfully',
                imageUrl: imageUrl
            });
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

// Multiple images upload (for batch)
const uploadMultiple = upload.array('images', 10);

const uploadMultipleImages = async (req, res) => {
    try {
        uploadMultiple(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No image files provided'
                });
            }
            
            const { supplierId } = req.body;
            if (!supplierId) {
                return res.status(400).json({
                    success: false,
                    message: 'Supplier ID is required'
                });
            }
            
            const imageUrls = [];
            for (const file of req.files) {
                const imageUrl = await processAndSaveImage(file, supplierId);
                imageUrls.push(imageUrl);
            }
            
            res.json({
                success: true,
                message: `${imageUrls.length} images uploaded successfully`,
                imageUrls: imageUrls
            });
        });
    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images',
            error: error.message
        });
    }
};

// Delete image
const deleteImage = async (req, res) => {
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image URL is required'
            });
        }
        
        // Extract filename from URL
        const filename = path.basename(imageUrl);
        const filePath = path.join(publicDir, filename);
        
        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Image deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error.message
        });
    }
};

// Serve static files (make sure this is in your main app.js)
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

module.exports = {
    uploadProductImage,
    uploadMultipleImages,
    deleteImage
};