require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const Razorpay = require('razorpay');
const fetch    = require('node-fetch');
const path     = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ── Serve static files (store.html + labs-data.csv) ─────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Razorpay instance (secret stays on server) ──────────────────
const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ────────────────────────────────────────────────────────────────
// GET /api/config
// Returns only the Razorpay Key ID (public-safe) to the frontend
// All other secrets NEVER leave the server
// ────────────────────────────────────────────────────────────────
app.get('/api/config', (req, res) => {
    res.json({
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
});

// ────────────────────────────────────────────────────────────────
// POST /api/create-order
// Creates a Razorpay order server-side (required for signature verification)
// Body: { amount: <number in paise> }
// ────────────────────────────────────────────────────────────────
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const order = await razorpay.orders.create({
            amount:   Math.round(amount),
            currency,
            receipt:  receipt || `rcpt_${Date.now()}`
        });
        res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (err) {
        console.error('Razorpay order error:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// ────────────────────────────────────────────────────────────────
// POST /api/send-email
// Sends order notification via EmailJS — credentials never exposed
// Body: { orderDetails, paymentId, orderId }
// ────────────────────────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
    try {
        const { orderDetails, paymentId, orderId } = req.body;
        if (!orderDetails || !paymentId) {
            return res.status(400).json({ error: 'Missing order details' });
        }

        const orderDate = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
        const subject   = `New Lab Order: ${orderDetails.labName} [${orderDetails.labId}] — ${orderDetails.totalFmt}`;
        const htmlBody  = buildEmailHTML({ razorpay_payment_id: paymentId, razorpay_order_id: orderId }, orderDetails, orderDate);

        const RECIPIENTS = [
            'itops@synergificsoftware.com',
            'vinay.chandra@synergificsoftware.com'
        ];

        const sends = RECIPIENTS.map(toEmail => {
            const body = {
                service_id:  process.env.EMAILJS_SERVICE_ID,
                template_id: process.env.EMAILJS_TEMPLATE_ID,
                user_id:     process.env.EMAILJS_PUBLIC_KEY,
                template_params: {
                    to_email:       toEmail,
                    from_name:      'Synergific Lab Store',
                    reply_to:       orderDetails.email,
                    subject:        subject,
                    message:        htmlBody,
                    payment_id:     paymentId  || 'N/A',
                    order_id:       orderId    || 'N/A',
                    lab_name:       orderDetails.labName,
                    lab_id:         orderDetails.labId,
                    plan:           orderDetails.plan,
                    qty:            String(orderDetails.qty),
                    customer_name:  orderDetails.name,
                    customer_email: orderDetails.email,
                    customer_phone: orderDetails.phone,
                    company:        orderDetails.company || '—',
                    subtotal:       orderDetails.subtotalFmt,
                    discount:       orderDetails.discountFmt,
                    gst:            orderDetails.gstFmt,
                    total:          orderDetails.totalFmt,
                    order_date:     orderDate
                }
            };
            return fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body)
            });
        });

        await Promise.all(sends);
        res.json({ success: true });

    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// ────────────────────────────────────────────────────────────────
// Email HTML builder (server-side)
// ────────────────────────────────────────────────────────────────
function buildEmailHTML(response, orderDetails, orderDate) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0f172a;padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;font-weight:800;color:#22c55e;letter-spacing:.18em;text-transform:uppercase;">Synergific Lab Store</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:900;color:white;letter-spacing:-.02em;">New Lab Order Received</h1>
            <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">${orderDate}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:14px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0;font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.1em;">✅ Payment Confirmed</p>
                <p style="margin:4px 0 0;font-size:13px;color:#166534;">
                  <strong>Payment ID:</strong> ${response.razorpay_payment_id || 'N/A'} &nbsp;|&nbsp;
                  <strong>Order ID:</strong> ${response.razorpay_order_id || 'N/A'}
                </p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 12px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.15em;">Lab Details</p>
            <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
              <tr style="background:#f8fafc;"><td style="padding:10px 14px;color:#64748b;font-weight:600;width:40%;">Lab Name</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;">${orderDetails.labName}</td></tr>
              <tr><td style="padding:10px 14px;color:#64748b;font-weight:600;">Lab ID</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;">${orderDetails.labId}</td></tr>
              <tr style="background:#f8fafc;"><td style="padding:10px 14px;color:#64748b;font-weight:600;">Plan</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;">${orderDetails.plan}</td></tr>
              <tr><td style="padding:10px 14px;color:#64748b;font-weight:600;">Quantity</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;">${orderDetails.qty}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 12px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.15em;">Customer Details</p>
            <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
              <tr style="background:#f8fafc;"><td style="padding:10px 14px;color:#64748b;font-weight:600;width:40%;">Name</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;">${orderDetails.name}</td></tr>
              <tr><td style="padding:10px 14px;color:#64748b;font-weight:600;">Email</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;">${orderDetails.email}</td></tr>
              <tr style="background:#f8fafc;"><td style="padding:10px 14px;color:#64748b;font-weight:600;">Phone</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;">${orderDetails.phone}</td></tr>
              <tr><td style="padding:10px 14px;color:#64748b;font-weight:600;">Company</td><td style="padding:10px 14px;color:#0f172a;font-weight:700;">${orderDetails.company || '—'}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 12px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.15em;">Pricing Breakdown</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
              <tr><td style="padding:8px 0;color:#64748b;font-weight:600;">Subtotal</td><td style="padding:8px 0;color:#0f172a;font-weight:700;text-align:right;">${orderDetails.subtotalFmt}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-weight:600;">Discount</td><td style="padding:8px 0;color:#16a34a;font-weight:700;text-align:right;">${orderDetails.discountFmt}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-weight:600;">GST (18%)</td><td style="padding:8px 0;color:#0f172a;font-weight:700;text-align:right;">${orderDetails.gstFmt}</td></tr>
              <tr><td colspan="2" style="padding:4px 0;"><hr style="border:none;border-top:1.5px solid #e2e8f0;"></td></tr>
              <tr><td style="padding:10px 0;color:#0f172a;font-size:15px;font-weight:900;">Total Paid (incl. GST)</td><td style="padding:10px 0;color:#22c55e;font-size:15px;font-weight:900;text-align:right;">${orderDetails.totalFmt}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:14px;">
              <tr><td style="padding:18px 20px;font-size:11px;color:#94a3b8;text-align:center;line-height:1.6;">
                This is an automated order notification from <strong style="color:#0f172a;">Synergific Lab Store</strong>.<br>
                Please provision the lab at your earliest convenience.
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Start server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Synergific Lab Store server running on http://localhost:${PORT}`);
    console.log(`   Serving files from: ${path.join(__dirname, 'public')}`);
});
