module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.json({
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY || null,
        emailjsPublicKey: process.env.EMAILJS_PUBLIC_KEY || null,
    });
};
