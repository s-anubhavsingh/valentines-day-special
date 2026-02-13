// api/upload.js - Vercel Serverless Function
// Stores images as base64 in Vercel's KV store

import { kv } from '@vercel/kv';

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

            // Generate unique ID for this image
            const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Save to Vercel KV (key-value store)
            await kv.set(imageId, imageData, { ex: 60 * 60 * 24 * 90 }); // Expires in 90 days

            return res.status(200).json({
                success: true,
                imageId,
                url: `/api/image?id=${imageId}`
            });

        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ error: 'Failed to upload image' });
        }
    }

    // GET: Retrieve image
    if (req.method === 'GET') {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'No image ID provided' });
            }

            const imageData = await kv.get(id);

            if (!imageData) {
                return res.status(404).json({ error: 'Image not found' });
            }

            // Extract base64 data and content type
            const matches = imageData.match(/^data:(.+);base64,(.+)$/);
            if (!matches) {
                return res.status(400).json({ error: 'Invalid image data' });
            }

            const contentType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');

            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.status(200).send(buffer);

        } catch (error) {
            console.error('Retrieve error:', error);
            return res.status(500).json({ error: 'Failed to retrieve image' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
