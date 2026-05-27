const express = require('express');
const router = express.Router();
const {
    uploadProductImage,
    uploadMultipleImages,
    deleteImage
} = require('../controllers/imageController');

// Upload single image
router.post('/upload', uploadProductImage);

// Upload multiple images
router.post('/upload-multiple', uploadMultipleImages);

// Delete image
router.delete('/delete', deleteImage);

module.exports = router;