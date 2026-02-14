// api/save-page.js - Save customization data and return short ID
// Uses KV for text data (perfect for small JSON objects)

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // POST: Save page data to KV
    if (req.method === 'POST') {
        try {
            const pageData = req.body;

            // Generate short ID (6 characters)
            const shortId = Math.random().toString(36).substring(2, 8);
            
            // Save to KV - store as object, not stringified
            await kv.set(`page:${shortId}`, pageData, {
                ex: 60 * 60 * 24 * 365 // Expire in 1 year
            });

            console.log(`Page saved with ID: ${shortId}`);

            return res.status(200).json({
                success: true,
                pageId: shortId
            });

        } catch (error) {
            console.error('Save error:', error);
            return res.status(500).json({ 
                error: 'Failed to save page',
                details: error.message 
            });
        }
    }

    // GET: Retrieve page data from KV
    if (req.method === 'GET') {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'No page ID provided' });
            }

            console.log(`Attempting to fetch page: ${id}`);

            // Fetch from KV - it returns the object directly
            const pageData = await kv.get(`page:${id}`);

            if (!pageData) {
                console.log(`Page not found: ${id}`);
                return res.status(404).json({ error: 'Page not found or expired' });
            }

            console.log(`Page found: ${id}`);

            return res.status(200).json({
                success: true,
                data: pageData
            });

        } catch (error) {
            console.error('Retrieve error:', error);
            return res.status(500).json({ 
                error: 'Failed to retrieve page',
                details: error.message 
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
