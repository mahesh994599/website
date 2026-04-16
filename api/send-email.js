const https = require('https');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { type, templateParams } = req.body || {};

    if (!type || !templateParams) {
        return res.status(400).json({ error: 'Missing type or templateParams' });
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    let templateId;

    if (type === 'order') {
        templateId = process.env.EMAILJS_TEMPLATE_ID;
    } else if (type === 'support') {
        templateId = process.env.EMAILJS_SUPPORT_TEMPLATE_ID;
    } else {
        return res.status(400).json({ error: 'Invalid email type' });
    }

    if (!serviceId || !templateId || !publicKey) {
        return res.status(500).json({ error: 'EmailJS not configured' });
    }

    const postData = JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
    });

    const options = {
        hostname: 'api.emailjs.com',
        path: '/api/v1.0/email/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const request = https.request(options, (emailRes) => {
        let data = '';
        emailRes.on('data', (chunk) => { data += chunk; });
        emailRes.on('end', () => {
            if (emailRes.statusCode >= 200 && emailRes.statusCode < 300) {
                res.json({ success: true });
            } else {
                res.status(emailRes.statusCode || 500).json({
                    error: 'EmailJS error',
                    details: data,
                });
            }
        });
    });

    request.on('error', () => {
        res.status(500).json({ error: 'Failed to connect to EmailJS' });
    });

    request.write(postData);
    request.end();
};
