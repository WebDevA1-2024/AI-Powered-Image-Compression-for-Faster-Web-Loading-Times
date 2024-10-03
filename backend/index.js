const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const B2 = require('backblaze-b2');
const fs = require('fs');

// Konfigurasi Backblaze B2
const b2 = new B2({
    applicationKeyId: '005a70b14cdc33e0000000001',  // Ganti dengan Application Key ID dari Backblaze
    applicationKey: 'K005OoXTzd2vjPkYqcxI8w3CsQ5sDlc'        // Ganti dengan Application Key dari Backblaze
});

const bucketId = 'ba87b04b5194dcad9c13031e';  // Ganti dengan Bucket ID dari Backblaze

const app = express();
const upload = multer({ dest: 'uploads/' });

// Fungsi untuk kompres gambar
const compressImage = async (imagePath, quality, width, height) => {
    const image = sharp(imagePath);
    const resizedImageBuffer = await image.resize(width, height).jpeg({ quality }).toBuffer();
    return resizedImageBuffer;
};

// Fungsi untuk upload file ke Backblaze B2
const uploadToB2 = async (buffer, filename) => {
    await b2.authorize();  // Authorize sebelum mengakses API
    const result = await b2.uploadFile({
        bucketId: bucketId,
        fileName: filename,
        data: buffer
    });
    return result;
};

// Endpoint untuk kompres dan upload gambar
app.post('/compress-image', upload.single('file'), async (req, res) => {
    const { connectionType, screenWidth, screenHeight } = req.body;
    const imagePath = req.file.path;
    const filename = req.file.originalname;

    let quality;
    switch (connectionType) {
        case 'slow-2g':
        case '2g':
            quality = 50;
            break;
        case '3g':
            quality = 70;
            break;
        default:
            quality = 85;
    }

    try {
        const compressedImage = await compressImage(imagePath, quality, screenWidth, screenHeight);
        const uploadResult = await uploadToB2(compressedImage, `compressed-${filename}`);
        fs.unlinkSync(imagePath);  // Hapus file lokal setelah diunggah
        res.json({ message: 'Image compressed and uploaded successfully', url: uploadResult.fileUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});