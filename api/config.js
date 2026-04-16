module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300');
    res.json({
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
        emailjsPublicKey: process.env.EMAILJS_PUBLIC_KEY,
    });
};
