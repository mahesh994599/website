const https = require('https');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, currency, metadata } = req.body || {};

    if (!amount || isNaN(amount) || amount < 50) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    const SK = process.env.STRIPE_SECRET_KEY;
    if (!SK) return res.status(500).json({ error: 'Stripe not configured' });

    const params = new URLSearchParams();
    params.append('amount', String(Math.round(amount)));
    params.append('currency', currency || 'usd');
    params.append('payment_method_types[]', 'card');
    if (metadata) {
        Object.entries(metadata).forEach(([k, v]) => {
            params.append(`metadata[${k}]`, String(v));
        });
    }

    const postData = params.toString();

    const options = {
        hostname: 'api.stripe.com',
        path: '/v1/payment_intents',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + SK,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const request = https.request(options, (stripeRes) => {
        let data = '';
        stripeRes.on('data', (chunk) => { data += chunk; });
        stripeRes.on('end', () => {
            try {
                const intent = JSON.parse(data);
                if (intent.error) {
                    return res.status(400).json({ error: intent.error.message });
                }
                res.json({ clientSecret: intent.client_secret, id: intent.id });
            } catch (e) {
                res.status(500).json({ error: 'Failed to parse Stripe response' });
            }
        });
    });

    request.on('error', () => {
        res.status(500).json({ error: 'Failed to connect to Stripe' });
    });

    request.write(postData);
    request.end();
};
