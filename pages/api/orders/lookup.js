// Helper function to check if a product belongs to "Zip & GO Sarees" collection
async function checkProductCollection(productId, shopDomain, accessToken) {
  try {
    console.log(`Checking collections for product ID: ${productId}`);
    
    // First, get the product details to see if we can find collection info
    const productResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-10/products/${productId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (productResponse.ok) {
      const productData = await productResponse.json();
      console.log('Product data:', JSON.stringify(productData.product, null, 2));
      
      // Check if product has collection info
      if (productData.product && productData.product.product_type) {
        const productType = productData.product.product_type.toLowerCase();
        if (productType.includes('zip') && productType.includes('go')) {
          console.log('Found Zip & GO in product type');
          return true;
        }
      }
      
      // Check product title
      if (productData.product && productData.product.title) {
        const productTitle = productData.product.title.toLowerCase();
        if (productTitle.includes('zip') && productTitle.includes('go')) {
          console.log('Found Zip & GO in product title');
          return true;
        }
      }
    }
    
    // Try to get collections for the product
    const collectionsResponse = await fetch(
      `https://${shopDomain}/admin/api/2023-10/products/${productId}/collections.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (collectionsResponse.ok) {
      const collectionsData = await collectionsResponse.json();
      console.log('Collections data:', JSON.stringify(collectionsData, null, 2));
      
      if (collectionsData.collections && collectionsData.collections.length > 0) {
        const isZipAndGo = collectionsData.collections.some(collection => {
          const title = collection.title.toLowerCase();
          return title.includes('zip') && title.includes('go');
        });
        console.log('Is Zip & GO collection:', isZipAndGo);
        return isZipAndGo;
      }
    } else {
      console.log('Collections API error:', collectionsResponse.status, collectionsResponse.statusText);
    }
    
  } catch (error) {
    console.log('Error checking product collection:', error.message);
  }
  return false;
}

// Helper function to get custom order status based on days and order type
async function getCustomOrderStatus(order, daysSinceOrder, isZipAndGoOrder) {
  const orderDate = new Date(order.created_at);
  
  if (isZipAndGoOrder) {
    // Zip & GO Sarees timeline
    if (daysSinceOrder < 0) return { stage: 'received', message: 'Order Received', days: 0 };
    if (daysSinceOrder < 5) return { stage: 'production', message: 'In Production', days: daysSinceOrder };
    if (daysSinceOrder < 10) return { stage: 'stitching', message: 'In Stitching', days: daysSinceOrder - 5 };
    if (daysSinceOrder < 15) return { stage: 'finishing', message: 'Finishing & Packing', days: daysSinceOrder - 10 };
    return { stage: 'dispatched', message: 'Dispatched', days: daysSinceOrder - 15 };
  } else {
    // Normal Shopify order status
    if (order.fulfillment_status === 'fulfilled') {
      return { stage: 'fulfilled', message: 'Order Fulfilled', days: daysSinceOrder };
    } else if (order.fulfillment_status === 'partial') {
      return { stage: 'partial', message: 'Partially Fulfilled', days: daysSinceOrder };
    } else if (order.financial_status === 'paid') {
      return { stage: 'processing', message: 'Processing Order', days: daysSinceOrder };
    } else if (order.financial_status === 'pending') {
      return { stage: 'pending', message: 'Payment Pending', days: daysSinceOrder };
    } else {
      return { stage: 'received', message: 'Order Received', days: daysSinceOrder };
    }
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const { orderNumber, email } = req.body;

  if (!orderNumber || !email) {
    return res.status(400).json({
      success: false,
      message: 'Order number and email are required'
    });
  }

  try {
    // Get environment variables
    const shopDomain = process.env.SHOP_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    console.log('Environment check:', {
      shopDomain: shopDomain ? 'Set' : 'Missing',
      accessToken: accessToken ? 'Set' : 'Missing',
      orderNumber,
      email
    });

    if (!shopDomain || !accessToken) {
      console.error('Missing environment variables:', {
        SHOP_DOMAIN: shopDomain,
        SHOPIFY_ACCESS_TOKEN: accessToken ? 'Set' : 'Missing'
      });
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Clean order number (remove # if present)
    const cleanOrderNumber = orderNumber.replace(/^#/, '');
    console.log('Cleaned order number:', cleanOrderNumber);
    
    // Search for orders by order number (include customer data)
    const apiUrl = `https://${shopDomain}/admin/api/2023-10/orders.json?name=${encodeURIComponent(cleanOrderNumber)}&status=any&limit=50&fields=id,name,email,customer,total_price,currency,created_at,financial_status,fulfillment_status,line_items,shipping_address,fulfillments`;
    console.log('Making API request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return res.status(500).json({
        success: false,
        message: 'Unable to connect to order system'
      });
    }

    const data = await response.json();
    let orders = data.orders || [];
    
    console.log('API Response data:', {
      totalOrders: orders.length,
      orderNames: orders.map(o => o.name),
      orderEmails: orders.map(o => o.email),
      customerEmails: orders.map(o => o.customer ? o.customer.email : 'No customer data')
    });
    
    // Log the full order data to see what's available
    if (orders.length > 0) {
      console.log('Full order data for debugging:', JSON.stringify(orders[0], null, 2));
    }
    
    // If no orders found by name, try searching by order ID if it's numeric
    if (orders.length === 0 && /^\d+$/.test(cleanOrderNumber)) {
      console.log('No orders found by name, trying by ID...');
      const idApiUrl = `https://${shopDomain}/admin/api/2023-10/orders/${cleanOrderNumber}.json`;
      console.log('Making ID API request to:', idApiUrl);
      
      try {
        const idResponse = await fetch(idApiUrl, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        });
        
        if (idResponse.ok) {
          const idData = await idResponse.json();
          orders = [idData.order];
          console.log('Found order by ID:', idData.order.name);
        }
      } catch (idError) {
        console.log('ID search failed:', idError.message);
      }
    }

    // Find matching order by email (check both order.email and customer.email)
    // If no email is found in the order, allow lookup by order number only
    let matchingOrder = orders.find(order => {
      const orderEmail = order.email ? order.email.toLowerCase().trim() : '';
      const customerEmail = order.customer && order.customer.email ? order.customer.email.toLowerCase().trim() : '';
      const searchEmail = email.toLowerCase().trim();
      
      const isMatch = orderEmail === searchEmail || customerEmail === searchEmail;
      
      console.log('Email comparison:', {
        orderName: order.name,
        orderEmail,
        customerEmail,
        searchEmail,
        isMatch
      });
      
      return isMatch;
    });
    
    // If no email match found and orders exist, check if we should allow order-only lookup
    if (!matchingOrder && orders.length > 0) {
      console.log('No email match found. Checking if order-only lookup should be allowed...');
      
      // For now, allow order lookup without email verification if no email is stored
      const orderWithNoEmail = orders.find(order => {
        const hasOrderEmail = order.email && order.email.trim() !== '';
        const hasCustomerEmail = order.customer && order.customer.email && order.customer.email.trim() !== '';
        return !hasOrderEmail && !hasCustomerEmail;
      });
      
      if (orderWithNoEmail) {
        console.log('Order found with no email data - allowing lookup by order number only');
        matchingOrder = orderWithNoEmail;
      }
    }
    
    console.log('Matching order found:', matchingOrder ? 'Yes' : 'No');

    if (matchingOrder) {
      // Calculate custom order status based on order date and product collection
      const orderDate = new Date(matchingOrder.created_at);
      const currentDate = new Date();
      const daysSinceOrder = Math.floor((currentDate - orderDate) / (1000 * 60 * 60 * 24));
      
      // Check if any product belongs to "Zip & GO Sarees" collection
      let isZipAndGoOrder = false;
      
      // First, check product names in line items (faster method)
      for (const item of matchingOrder.line_items) {
        const productName = item.name ? item.name.toLowerCase() : '';
        const productTitle = item.title ? item.title.toLowerCase() : '';
        
        if (productName.includes('zip') && productName.includes('go')) {
          console.log('Found Zip & GO in product name:', item.name);
          isZipAndGoOrder = true;
          break;
        }
        
        if (productTitle.includes('zip') && productTitle.includes('go')) {
          console.log('Found Zip & GO in product title:', item.title);
          isZipAndGoOrder = true;
          break;
        }
      }
      
      // If not found in names, check product collections via API
      if (!isZipAndGoOrder) {
        for (const item of matchingOrder.line_items) {
          if (item.product_id) {
            const isZipAndGo = await checkProductCollection(item.product_id, shopDomain, accessToken);
            if (isZipAndGo) {
              isZipAndGoOrder = true;
              break;
            }
          }
        }
      }
      
      console.log('Final Zip & GO determination:', isZipAndGoOrder);
      
      // Temporary: For testing purposes, you can manually set this to true to see Zip & GO timeline
      // Remove this line once collection detection is working properly
      isZipAndGoOrder = true; // Uncomment this line to test Zip & GO timeline
      
      // Get custom order status
      const customStatus = await getCustomOrderStatus(matchingOrder, daysSinceOrder, isZipAndGoOrder);

      // Format the order data for response
      const formattedOrder = {
        id: matchingOrder.id,
        name: matchingOrder.name,
        email: matchingOrder.email || (matchingOrder.customer ? matchingOrder.customer.email : null),
        total_price: matchingOrder.total_price,
        currency: matchingOrder.currency,
        created_at: matchingOrder.created_at,
        financial_status: matchingOrder.financial_status,
        fulfillment_status: matchingOrder.fulfillment_status,
        custom_status: customStatus,
        is_zip_and_go: isZipAndGoOrder,
        line_items: matchingOrder.line_items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variant_title: item.variant_title,
          image: item.image
        })),
        shipping_address: matchingOrder.shipping_address ? {
          first_name: matchingOrder.shipping_address.first_name,
          last_name: matchingOrder.shipping_address.last_name,
          address1: matchingOrder.shipping_address.address1,
          address2: matchingOrder.shipping_address.address2,
          city: matchingOrder.shipping_address.city,
          province: matchingOrder.shipping_address.province,
          zip: matchingOrder.shipping_address.zip,
          country: matchingOrder.shipping_address.country,
          phone: matchingOrder.shipping_address.phone
        } : null,
        fulfillments: matchingOrder.fulfillments || []
      };

      return res.status(200).json({
        success: true,
        order: formattedOrder
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'Order not found. Please check your order number and email address.'
      });
    }

  } catch (error) {
    console.error('Order lookup error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while searching for your order. Please try again later.'
    });
  }
}
