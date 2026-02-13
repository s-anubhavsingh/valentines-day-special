// api/save-page.js - Save customization data and return short ID

import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // POST: Save page data
    if (req.method === 'POST') {
        try {
            const pageData = req.body;

            // Generate short ID (6 characters)
            const shortId = Math.random().toString(36).substring(2, 8);
            
            // Save as JSON in Blob storage
            const jsonData = JSON.stringify(pageData);
            const blob = await put(`pages/${shortId}.json`, jsonData, {
                access: 'public',
                contentType: 'application/json',
            });

            return res.status(200).json({
                success: true,
                pageId: shortId,
                blobUrl: blob.url
            });

        } catch (error) {
            console.error('Save error:', error);
            return res.status(500).json({ 
                error: 'Failed to save page',
                details: error.message 
            });
        }
    }

    // GET: Retrieve page data by ID
    if (req.method === 'GET') {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'No page ID provided' });
            }

            // List all blobs with the matching prefix
            const { blobs } = await list({
                prefix: `pages/${id}.json`,
                limit: 1
            });

            if (blobs.length === 0) {
                return res.status(404).json({ error: 'Page not found' });
            }

            // Fetch the blob content
            const response = await fetch(blobs[0].url);
            
            if (!response.ok) {
                return res.status(404).json({ error: 'Failed to fetch page data' });
            }

            const pageData = await response.json();

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
