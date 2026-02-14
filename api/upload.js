// api/upload.js - Vercel Serverless Function
// Uses Vercel Blob Storage for images (supports larger files)

import { put } from '@vercel/blob';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    // Allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // POST: Upload image
    if (req.method === 'POST') {
        try {
            const { imageData, fileName } = req.body;

            if (!imageData) {
                return res.status(400).json({ error: 'No image data provided' });
            }

            // Convert base64 to buffer
            const matches = imageData.match(/^data:(.+);base64,(.+)$/);
            if (!matches) {
                return res.status(400).json({ error: 'Invalid image data format' });
            }

            const contentType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');

            // Generate unique filename
            const timestamp = Date.now();
            const random = Math.random().toString(36).substr(2, 9);
            const extension = contentType.split('/')[1] || 'jpg';
            const blobFileName = `${fileName}_${timestamp}_${random}.${extension}`;

            // Upload to Vercel Blob
            const blob = await put(blobFileName, buffer, {
                access: 'public',
                contentType: contentType,
            });

            return res.status(200).json({
                success: true,
                url: blob.url,
                downloadUrl: blob.downloadUrl
            });

        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ 
                error: 'Failed to upload image',
                details: error.message 
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
