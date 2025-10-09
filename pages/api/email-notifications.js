import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify this is a legitimate request (you can add API key verification here)
  const { apiKey } = req.body;
  if (apiKey !== process.env.CRON_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const shopDomain = process.env.SHOP_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopDomain || !accessToken) {
      throw new Error('Missing Shopify credentials');
    }

    // Get all unfulfilled orders from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const createdAtMin = thirtyDaysAgo.toISOString();

    const apiUrl = `https://${shopDomain}/admin/api/2023-10/orders.json?status=any&fulfillment_status=unfulfilled&created_at_min=${createdAtMin}&limit=250&fields=id,name,email,customer,created_at,financial_status,fulfillment_status,line_items`;

    console.log('Fetching unfulfilled orders from:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const orders = data.orders || [];

    console.log(`Found ${orders.length} unfulfilled orders`);

    // Filter orders that should receive notifications
    const ordersToNotify = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const daysSinceOrder = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
      
      // Send notification every 3 days (3, 6, 9, 12, 15, 18, 21, 24, 27, 30 days)
      return daysSinceOrder >= 3 && daysSinceOrder % 3 === 0 && order.email;
    });

    console.log(`${ordersToNotify.length} orders eligible for notification`);

    // Set up email transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // You can change this to your preferred email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });

    const trackingUrl = 'https://krutika-tracking.vercel.app/';
    let emailsSent = 0;
    let errors = [];

    // Send emails to eligible orders
    for (const order of ordersToNotify) {
      try {
        const emailHtml = generateEmailTemplate(order, trackingUrl);
        
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: order.email,
          subject: `📦 Order Update: ${order.name} - Kruthika Designer Studio`,
          html: emailHtml,
        });

        emailsSent++;
        console.log(`Email sent for order ${order.name} to ${order.email}`);
      } catch (emailError) {
        console.error(`Failed to send email for order ${order.name}:`, emailError);
        errors.push({
          order: order.name,
          email: order.email,
          error: emailError.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Email notifications processed`,
      stats: {
        totalOrders: orders.length,
        eligibleOrders: ordersToNotify.length,
        emailsSent,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Email notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

function generateEmailTemplate(order, trackingUrl) {
  const orderDate = new Date(order.created_at);
  const daysSinceOrder = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
  
  // Determine order status based on days
  let statusMessage = '';
  let statusColor = '#3B82F6';
  
  if (daysSinceOrder <= 5) {
    statusMessage = 'Your order has been received and is being prepared for production.';
    statusColor = '#10B981';
  } else if (daysSinceOrder <= 10) {
    statusMessage = 'Your order is currently in production. Our skilled artisans are working on your beautiful pieces.';
    statusColor = '#F59E0B';
  } else if (daysSinceOrder <= 15) {
    statusMessage = 'Your order is in the stitching phase. Every detail is being carefully crafted.';
    statusColor = '#8B5CF6';
  } else if (daysSinceOrder <= 20) {
    statusMessage = 'Your order is in the finishing and packing stage. Almost ready!';
    statusColor = '#EF4444';
  } else {
    statusMessage = 'Your order is in the final stages and will be dispatched soon.';
    statusColor = '#DC2626';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - Kruthika Designer Studio</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #7C3AED;
          margin-bottom: 10px;
        }
        .order-info {
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: bold;
          margin: 10px 0;
        }
        .track-button {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED, #A855F7);
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .track-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .items-list {
          margin: 15px 0;
        }
        .item {
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏪 Kruthika Designer Studio</div>
          <h1>Order Update</h1>
        </div>

        <p>Dear Valued Customer,</p>
        
        <p>We hope you're doing well! We wanted to provide you with an update on your order.</p>

        <div class="order-info">
          <h3>📦 Order Details</h3>
          <p><strong>Order Number:</strong> ${order.name}</p>
          <p><strong>Order Date:</strong> ${orderDate.toLocaleDateString()}</p>
          <p><strong>Days Since Order:</strong> ${daysSinceOrder} days</p>
          
          <div class="items-list">
            <h4>Items Ordered:</h4>
            ${order.line_items.map(item => `
              <div class="item">
                <strong>${item.name}</strong> (Qty: ${item.quantity})
              </div>
            `).join('')}
          </div>
        </div>

        <div style="text-align: center;">
          <div class="status-badge" style="background-color: ${statusColor};">
            ${statusMessage}
          </div>
        </div>

        <p>We understand you're excited to receive your order, and we're working hard to ensure it meets our high standards of quality and craftsmanship.</p>

        <div style="text-align: center;">
          <a href="${trackingUrl}" class="track-button">
            🔍 Track Your Order
          </a>
        </div>

        <p>If you have any questions or concerns, please don't hesitate to contact us. We're here to help!</p>

        <div class="footer">
          <p>Thank you for choosing Kruthika Designer Studio!</p>
          <p>Best regards,<br>The Kruthika Team</p>
          <p><small>This is an automated message. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
