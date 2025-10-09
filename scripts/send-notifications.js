const https = require('https');
const http = require('http');

// Configuration
const API_URL = process.env.API_URL || 'https://krutika-tracking.vercel.app/api/email-notifications';
const API_KEY = process.env.CRON_API_KEY;

if (!API_KEY) {
  console.error('❌ CRON_API_KEY environment variable is required');
  process.exit(1);
}

async function sendNotifications() {
  try {
    console.log('🚀 Starting email notification process...');
    console.log(`📡 Calling API: ${API_URL}`);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: API_KEY,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Email notifications sent successfully!');
      console.log('📊 Statistics:');
      console.log(`   - Total unfulfilled orders: ${result.stats.totalOrders}`);
      console.log(`   - Orders eligible for notification: ${result.stats.eligibleOrders}`);
      console.log(`   - Emails sent: ${result.stats.emailsSent}`);
      console.log(`   - Errors: ${result.stats.errors}`);
      
      if (result.errors && result.errors.length > 0) {
        console.log('⚠️  Errors encountered:');
        result.errors.forEach(error => {
          console.log(`   - Order ${error.order} (${error.email}): ${error.error}`);
        });
      }
    } else {
      console.error('❌ Failed to send notifications:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error sending notifications:', error.message);
    process.exit(1);
  }
}

// Run the notification process
sendNotifications();
