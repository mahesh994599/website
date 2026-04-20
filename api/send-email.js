const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

function buildOrderHTML(p) {
    return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:24px 32px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:20px;">Synergific Lab Store</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">Order Confirmation</p>
        </div>
        <div style="padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
            <h2 style="color:#1e293b;font-size:16px;margin:0 0 16px;">New Lab Order</h2>
            <table style="width:100%;border-collapse:collapse;font-size:13px;color:#334155;">
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;width:140px;">Lab</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.lab_name || ''} [${p.lab_id || ''}]</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">Plan</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.plan || ''}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">Quantity</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.qty || '1'}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">Customer</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.customer_name || ''}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.customer_email || ''}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.customer_phone || ''}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">Company</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.company || '—'}</td></tr>
            </table>
            <div style="background:#f8fafc;border-radius:6px;padding:16px;margin:20px 0;">
                <table style="width:100%;border-collapse:collapse;font-size:13px;color:#334155;">
                    <tr><td style="padding:4px 0;">Subtotal</td><td style="padding:4px 0;text-align:right;">${p.subtotal || ''}</td></tr>
                    <tr><td style="padding:4px 0;">Discount</td><td style="padding:4px 0;text-align:right;">${p.discount || '—'}</td></tr>
                    <tr><td style="padding:4px 0;">GST (18%)</td><td style="padding:4px 0;text-align:right;">${p.gst || ''}</td></tr>
                    <tr style="font-weight:700;font-size:15px;color:#6366f1;"><td style="padding:8px 0;border-top:2px solid #e5e7eb;">Total</td><td style="padding:8px 0;border-top:2px solid #e5e7eb;text-align:right;">${p.total || ''}</td></tr>
                </table>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:13px;color:#334155;">
                <tr><td style="padding:6px 0;font-weight:600;">Payment ID</td><td style="padding:6px 0;">${p.payment_id || 'N/A'}</td></tr>
                <tr><td style="padding:6px 0;font-weight:600;">Order ID</td><td style="padding:6px 0;">${p.order_id || 'N/A'}</td></tr>
                <tr><td style="padding:6px 0;font-weight:600;">Order Date</td><td style="padding:6px 0;">${p.order_date || ''}</td></tr>
            </table>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#94a3b8;text-align:center;">
                Synergific Software Pvt. Ltd. · itops@synergificsoftware.com
            </div>
        </div>
    </div>`;
}

function buildSupportHTML(p) {
    return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:24px 32px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:20px;">Synergific Lab Store</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">Support Request</p>
        </div>
        <div style="padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
            <h2 style="color:#1e293b;font-size:16px;margin:0 0 16px;">${p.support_subject || p.subject || 'Support Request'}</h2>
            <table style="width:100%;border-collapse:collapse;font-size:13px;color:#334155;">
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;width:120px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.customer_name || p.name || ''}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.customer_email || ''}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.customer_phone || ''}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">Submitted</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${p.submitted_at || ''}</td></tr>
            </table>
            <div style="background:#f8fafc;border-radius:6px;padding:16px;margin:20px 0;font-size:13px;color:#334155;line-height:1.7;">
                ${(p.support_message || p.message || '').replace(/\n/g, '<br>')}
            </div>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#94a3b8;text-align:center;">
                Synergific Software Pvt. Ltd. · itops@synergificsoftware.com
            </div>
        </div>
    </div>`;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { type, templateParams } = req.body || {};

    if (!type || !templateParams) {
        return res.status(400).json({ error: 'Missing type or templateParams' });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    if (!gmailUser || !gmailPass) {
        return res.status(500).json({ error: 'Email not configured' });
    }

    let subject, html, to;

    if (type === 'order') {
        subject = templateParams.subject || 'New Lab Order — Synergific Lab Store';
        html = buildOrderHTML(templateParams);
        to = templateParams.to_email || 'itops@synergificsoftware.com';
    } else if (type === 'support') {
        subject = templateParams.subject || '[Support Request] — Synergific Lab Store';
        html = buildSupportHTML(templateParams);
        to = templateParams.to_email || 'itops@synergificsoftware.com';
    } else {
        return res.status(400).json({ error: 'Invalid email type' });
    }

    try {
        await transporter.sendMail({
            from: `"Synergific Lab Store" <${gmailUser}>`,
            to,
            replyTo: templateParams.reply_to || gmailUser,
            subject,
            html,
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).json({ error: 'Failed to send email', details: err.message });
    }
};
