import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { configureCloudinary } from '../config/cloudinary';
const router = Router();

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});


// Upload image endpoint
router.post('/', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No image file uploaded' });
      return;
    }

    // Convert file buffer to base64 data URI for Cloudinary upload
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    console.log(`📤 Uploading image to Cloudinary... (${req.file.originalname})`);

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'node_graph_editor',
      resource_type: 'image',
    });

    console.log(`✅ Image uploaded to Cloudinary: ${result.secure_url}`);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    console.error('❌ Cloudinary Upload Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to upload image to Cloudinary',
    });
  }
});

export default router;
