# Shopify Order Tracker

A simple, free order tracking application for Shopify stores built with Next.js and deployed on Vercel.

## Features

- ✅ **Free to deploy** on Vercel
- ✅ **Real-time order lookup** using Shopify API
- ✅ **Responsive design** works on all devices
- ✅ **Professional UI** with order details, tracking info, and shipping address
- ✅ **Secure** - no sensitive data stored
- ✅ **Fast** - serverless functions for instant responses

## Quick Setup (5 Minutes)

### 1. Get Shopify API Credentials

1. Go to your Shopify Admin
2. Navigate to **Apps** > **App and sales channel settings**
3. Click **Develop apps**
4. Click **Create an app**
5. Name it "Order Tracker"
6. Click **Configure Admin API scopes**
7. Enable these scopes:
   - `read_orders`
   - `read_customers` (optional)
8. Click **Save**
9. Click **Install app**
10. Copy the **Admin API access token**

### 2. Deploy to Vercel

1. **Fork this repository** on GitHub
2. Go to [vercel.com](https://vercel.com) and sign up
3. Click **"New Project"**
4. Import your forked repository
5. Add these environment variables:
   - `SHOP_DOMAIN`: `your-shop-name.myshopify.com`
   - `SHOPIFY_ACCESS_TOKEN`: `your_admin_api_access_token`
6. Click **Deploy**

### 3. Test Your App

1. Visit your Vercel URL
2. Enter a test order number and email
3. Verify it shows order information

## Environment Variables

Create a `.env.local` file for local development:

```env
SHOP_DOMAIN=your-shop-name.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_admin_api_access_token
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Embed in Your Shopify Store

### Option 1: Add to Theme

Add this to your theme's page template:

```liquid
<iframe 
  src="https://your-app.vercel.app" 
  width="100%" 
  height="600px" 
  frameborder="0"
  style="border-radius: 8px;">
</iframe>
```

### Option 2: Create a Page

1. Create a new page in Shopify Admin
2. Add the iframe code above
3. Set the page handle to "track-order"

## Customization

### Styling
Edit the CSS in `pages/index.js` to match your brand colors.

### Features
- Add email notifications
- Add SMS tracking
- Add order history
- Add return requests

## Troubleshooting

### "Order not found" error
- Verify the order number format (with or without #)
- Check that the email matches exactly
- Ensure the order exists in your store

### API errors
- Verify your access token is correct
- Check that the required scopes are enabled
- Ensure your shop domain is correct

### Deployment issues
- Check environment variables are set correctly
- Verify the repository is public (for free Vercel)
- Check Vercel function logs for errors

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel function logs
3. Verify Shopify API credentials

## License

MIT License - feel free to use and modify for your store!
