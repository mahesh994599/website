const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// Ensure rupee symbol renders correctly across all email clients
function safe(str) {
    return (str || '').replace(/₹/g, '&#8377;');
}

function buildOrderHTML(p) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:32px 40px;border-radius:12px 12px 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td><h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Synergific</h1>
            <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;">Lab Store</p></td>
            <td align="right"><span style="display:inline-block;background:#22c55e;color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">Order Confirmed</span></td>
        </tr>
        </table>
    </td></tr>

    <!-- Order ID Strip -->
    <tr><td style="background:#6366f1;padding:14px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="color:rgba(255,255,255,0.85);font-size:12px;">Payment ID: <strong style="color:#fff;">${safe(p.payment_id) || 'N/A'}</strong></td>
            <td align="right" style="color:rgba(255,255,255,0.85);font-size:12px;">${safe(p.order_date) || ''}</td>
        </tr>
        </table>
    </td></tr>

    <!-- Body -->
    <tr><td style="background:#ffffff;padding:32px 40px;">

        <!-- Lab Details Card -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6366f1;font-weight:700;">Lab Environment</p>
            <h2 style="margin:0 0 6px;font-size:18px;color:#0f172a;font-weight:700;">${safe(p.lab_name) || ''}</h2>
            <table cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr>
                <td style="background:#e0e7ff;color:#4338ca;font-size:11px;font-weight:600;padding:4px 10px;border-radius:4px;margin-right:8px;">${safe(p.lab_id) || ''}</td>
                <td style="width:8px;"></td>
                <td style="background:#f0fdf4;color:#15803d;font-size:11px;font-weight:600;padding:4px 10px;border-radius:4px;">${safe(p.plan) || ''}</td>
                <td style="width:8px;"></td>
                <td style="background:#fef3c7;color:#92400e;font-size:11px;font-weight:600;padding:4px 10px;border-radius:4px;">Qty: ${safe(p.qty) || '1'}</td>
            </tr>
            </table>
        </div>

        <!-- Customer Info -->
        <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;">Customer Details</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;margin-bottom:24px;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;width:130px;color:#64748b;">Name</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${safe(p.customer_name) || ''}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Email</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${safe(p.customer_email) || ''}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${safe(p.customer_phone) || ''}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;">Company</td><td style="padding:10px 0;font-weight:600;">${safe(p.company) || '&#8212;'}</td></tr>
        </table>

        <!-- Payment Summary -->
        <div style="background:#0f172a;border-radius:10px;padding:24px;color:#fff;">
            <p style="margin:0 0 16px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;">Payment Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
                <tr><td style="padding:6px 0;color:#cbd5e1;">Subtotal</td><td style="padding:6px 0;text-align:right;color:#e2e8f0;">${safe(p.subtotal) || ''}</td></tr>
                <tr><td style="padding:6px 0;color:#cbd5e1;">Discount</td><td style="padding:6px 0;text-align:right;color:#34d399;">${safe(p.discount) || '&#8212;'}</td></tr>
                <tr><td style="padding:6px 0;color:#cbd5e1;">GST (18%)</td><td style="padding:6px 0;text-align:right;color:#e2e8f0;">${safe(p.gst) || ''}</td></tr>
                <tr><td colspan="2" style="padding:8px 0;"><div style="border-top:1px solid #334155;"></div></td></tr>
                <tr><td style="padding:6px 0;font-size:17px;font-weight:800;color:#fff;">Total</td><td style="padding:6px 0;text-align:right;font-size:17px;font-weight:800;color:#818cf8;">${safe(p.total) || ''}</td></tr>
            </table>
        </div>

    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#f8fafc;padding:24px 40px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="font-size:11px;color:#94a3b8;line-height:1.6;">
                <strong style="color:#64748b;">Synergific Software Pvt. Ltd.</strong><br>
                itops@synergificsoftware.com &#183; +91 70044 03223
            </td>
            <td align="right" style="font-size:11px;color:#94a3b8;">
                Order ID: ${safe(p.order_id) || 'N/A'}
            </td>
        </tr>
        </table>
    </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildSupportHTML(p) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:32px 40px;border-radius:12px 12px 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td><h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Synergific</h1>
            <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;">Lab Store</p></td>
            <td align="right"><span style="display:inline-block;background:#f59e0b;color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">Support Request</span></td>
        </tr>
        </table>
    </td></tr>

    <!-- Subject Strip -->
    <tr><td style="background:#6366f1;padding:14px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="color:#fff;font-size:13px;font-weight:600;">${safe(p.support_subject || p.subject || 'Support Request')}</td>
            <td align="right" style="color:rgba(255,255,255,0.85);font-size:12px;">${safe(p.submitted_at) || ''}</td>
        </tr>
        </table>
    </td></tr>

    <!-- Body -->
    <tr><td style="background:#ffffff;padding:32px 40px;">

        <!-- Customer Info -->
        <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;">Contact Information</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;margin-bottom:24px;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;width:100px;color:#64748b;">Name</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${safe(p.customer_name || p.name) || ''}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Email</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${safe(p.customer_email) || ''}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;">Phone</td><td style="padding:10px 0;font-weight:600;">${safe(p.customer_phone) || ''}</td></tr>
        </table>

        <!-- Message -->
        <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;">Message</p>
        <div style="background:#f8fafc;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;padding:20px 24px;font-size:14px;color:#334155;line-height:1.8;">
            ${(safe(p.support_message || p.message || '')).replace(/\n/g, '<br>')}
        </div>

    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#f8fafc;padding:24px 40px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
        <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;text-align:center;">
            <strong style="color:#64748b;">Synergific Software Pvt. Ltd.</strong><br>
            itops@synergificsoftware.com &#183; +91 70044 03223<br>
            <span style="color:#cbd5e1;">Our team will respond within 2 hours.</span>
        </p>
    </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
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
        subject = templateParams.subject || 'New Lab Order \u2014 Synergific Lab Store';
        html = buildOrderHTML(templateParams);
        to = templateParams.to_email || 'itops@synergificsoftware.com';
    } else if (type === 'support') {
        subject = templateParams.subject || '[Support Request] \u2014 Synergific Lab Store';
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
