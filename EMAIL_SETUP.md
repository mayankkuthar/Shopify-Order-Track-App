# Email Notifications Setup Guide

This guide will help you set up automated email notifications for unfulfilled orders that are sent every 3 days with a link to track orders at https://krutika-tracking.vercel.app/.

## 🚀 Features

- **Automated Notifications**: Sends emails every 3 days to customers with unfulfilled orders
- **Smart Filtering**: Only sends notifications on days 3, 6, 9, 12, 15, 18, 21, 24, 27, and 30
- **Beautiful Email Templates**: Professional HTML emails with order details and tracking links
- **Order Status Updates**: Dynamic status messages based on days since order
- **Error Handling**: Comprehensive error logging and reporting

## 📧 Email Service Setup

### Option 1: Gmail (Recommended for testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Add to environment variables**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your_16_character_app_password
   EMAIL_FROM=Kruthika Designer Studio <your-email@gmail.com>
   ```

### Option 2: SendGrid (Recommended for production)

1. **Sign up** for SendGrid account
2. **Create API Key** with Mail Send permissions
3. **Update the email configuration** in `pages/api/email-notifications.js`:
   ```javascript
   const transporter = nodemailer.createTransporter({
     service: 'sendgrid',
     auth: {
       user: 'apikey',
       pass: process.env.SENDGRID_API_KEY,
     },
   });
   ```
4. **Add to environment variables**:
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_FROM=Kruthika Designer Studio <noreply@yourdomain.com>
   ```

### Option 3: Other Email Services

You can configure any SMTP service by updating the transporter configuration in `pages/api/email-notifications.js`.

## 🔧 Environment Variables

Add these to your `.env` file:

```env
# Shopify Configuration (already configured)
SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_access_token

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Kruthika Designer Studio <noreply@kruthika.com>

# API Security
CRON_API_KEY=your_secure_random_api_key_here

# Optional: Custom tracking URL
TRACKING_URL=https://krutika-tracking.vercel.app/
```

## 🕒 Cron Job Setup

### Vercel (Automatic)

The cron job is already configured in `vercel.json` to run every 3 days at 9 AM:

```json
{
  "crons": [
    {
      "path": "/api/email-notifications",
      "schedule": "0 9 */3 * *"
    }
  ]
}
```

### Manual Testing

You can test the email notifications manually:

1. **Using the test endpoint**:
   ```bash
   curl -X POST https://krutika-tracking.vercel.app/api/test-notifications \
     -H "Content-Type: application/json" \
     -d '{"apiKey":"your_cron_api_key"}'
   ```

2. **Using the script**:
   ```bash
   npm run send-notifications
   ```

## 📊 How It Works

1. **Every 3 days at 9 AM**, Vercel triggers the cron job
2. **Fetches unfulfilled orders** from Shopify (last 30 days)
3. **Filters orders** that should receive notifications (days 3, 6, 9, 12, 15, 18, 21, 24, 27, 30)
4. **Sends personalized emails** with:
   - Order details and items
   - Current status based on days since order
   - Direct link to track order
   - Professional branding

## 📧 Email Template Features

- **Responsive Design**: Works on all devices
- **Dynamic Status**: Updates based on days since order
- **Order Details**: Shows order number, date, items, and quantity
- **Tracking Link**: Direct button to track order
- **Professional Branding**: Matches your store's style

## 🔒 Security

- **API Key Protection**: Only authorized requests can trigger notifications
- **Rate Limiting**: Built-in protection against spam
- **Error Handling**: Comprehensive logging without exposing sensitive data

## 📈 Monitoring

The system provides detailed statistics:
- Total unfulfilled orders found
- Orders eligible for notification
- Emails successfully sent
- Any errors encountered

## 🛠️ Troubleshooting

### Common Issues

1. **"Authentication failed"**:
   - Check your email credentials
   - Ensure 2FA is enabled and app password is correct

2. **"No orders found"**:
   - Verify Shopify credentials
   - Check if there are unfulfilled orders in the last 30 days

3. **"Emails not sending"**:
   - Check email service configuration
   - Verify SMTP settings
   - Check spam folder

### Debug Mode

Add logging to see detailed information:
```javascript
console.log('Debug info:', { orders, eligibleOrders, emailsSent });
```

## 🚀 Deployment

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

4. **Verify cron job** is active in Vercel dashboard

## 📞 Support

If you need help setting up email notifications, check:
- Email service documentation
- Vercel cron job documentation
- Shopify API documentation

The system is designed to be robust and handle errors gracefully while providing detailed feedback for troubleshooting.
