import { useState } from 'react';
import Head from 'next/head';

export default function OrderTracker() {
  const [formData, setFormData] = useState({
    orderNumber: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.order);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An error occurred while searching for your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Head>
        <title>Track Your Order - Kruthika Designer Studio</title>
        <meta name="description" content="Track your order status and shipping information" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <div className="header">
          <div className="logo-section">
            <div className="logo">🏪</div>
            <h1>Kruthika Designer Studio</h1>
          </div>
          <h2>Track Your Order</h2>
          <p>Enter your order number and email address to view your order status and progress</p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="order-form">
            <div className="form-header">
              <h3>🔍 Order Lookup</h3>
              <p>Enter your details to track your order</p>
            </div>
            
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="orderNumber">
                  <span className="label-icon">📦</span>
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., #2111 or 2111"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              <span className="btn-icon">{loading ? '⏳' : '🔍'}</span>
              <span className="btn-text">{loading ? 'Searching...' : 'Track Order'}</span>
            </button>
          </form>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <h4>Order Not Found</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="order-info">
            <div className="order-header-section">
              <h3>📋 Order Information</h3>
            </div>
            
            <div className="order-header">
              <div className="order-detail">
                <span className="label">Order Number:</span>
                <span className="value">{result.name}</span>
              </div>
              <div className="order-detail">
                <span className="label">Order Date:</span>
                <span className="value">{new Date(result.created_at).toLocaleDateString()}</span>
              </div>
              <div className="order-detail">
                <span className="label">Total:</span>
                <span className="value">{result.currency} {result.total_price}</span>
              </div>
              <div className="order-detail">
                <span className="label">Status:</span>
                <span className={`value status ${result.custom_status.stage}`}>
                  {result.custom_status.message}
                </span>
              </div>
            </div>

            {/* Order Progress Timeline */}
            <div className="order-section">
              <h4>Order Progress</h4>
              <div className="progress-timeline">
                {result.is_zip_and_go ? (
                  // Zip & GO Sarees Timeline
                  <>
                    <div className={`timeline-step ${result.custom_status.stage === 'received' ? 'active' : result.custom_status.stage === 'production' || result.custom_status.stage === 'stitching' || result.custom_status.stage === 'finishing' || result.custom_status.stage === 'dispatched' ? 'completed' : ''}`}>
                      <div className="step-icon">📦</div>
                      <div className="step-content">
                        <div className="step-title">Order Received</div>
                        <div className="step-desc">Order confirmed and received</div>
                      </div>
                    </div>
                    <div className={`timeline-step ${result.custom_status.stage === 'production' ? 'active' : result.custom_status.stage === 'stitching' || result.custom_status.stage === 'finishing' || result.custom_status.stage === 'dispatched' ? 'completed' : ''}`}>
                      <div className="step-icon">🏭</div>
                      <div className="step-content">
                        <div className="step-title">Production</div>
                        <div className="step-desc">Materials being prepared</div>
                      </div>
                    </div>
                    <div className={`timeline-step ${result.custom_status.stage === 'stitching' ? 'active' : result.custom_status.stage === 'finishing' || result.custom_status.stage === 'dispatched' ? 'completed' : ''}`}>
                      <div className="step-icon">✂️</div>
                      <div className="step-content">
                        <div className="step-title">Stitching</div>
                        <div className="step-desc">Saree being stitched</div>
                      </div>
                    </div>
                    <div className={`timeline-step ${result.custom_status.stage === 'finishing' ? 'active' : result.custom_status.stage === 'dispatched' ? 'completed' : ''}`}>
                      <div className="step-icon">🎁</div>
                      <div className="step-content">
                        <div className="step-title">Finishing & Packing</div>
                        <div className="step-desc">Final touches and packaging</div>
                      </div>
                    </div>
                    <div className={`timeline-step ${result.custom_status.stage === 'dispatched' ? 'active' : ''}`}>
                      <div className="step-icon">🚚</div>
                      <div className="step-content">
                        <div className="step-title">Dispatched</div>
                        <div className="step-desc">Order shipped to you</div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Standard Order Timeline
                  <>
                    <div className={`timeline-step ${result.custom_status.stage === 'received' || result.custom_status.stage === 'pending' ? 'active' : 'completed'}`}>
                      <div className="step-icon">📦</div>
                      <div className="step-content">
                        <div className="step-title">Order Received</div>
                        <div className="step-desc">Order confirmed and received</div>
                      </div>
                    </div>
                    <div className={`timeline-step ${result.custom_status.stage === 'processing' ? 'active' : result.custom_status.stage === 'partial' || result.custom_status.stage === 'fulfilled' ? 'completed' : ''}`}>
                      <div className="step-icon">⚙️</div>
                      <div className="step-content">
                        <div className="step-title">Processing</div>
                        <div className="step-desc">Preparing your order</div>
                      </div>
                    </div>
                    <div className={`timeline-step ${result.custom_status.stage === 'fulfilled' ? 'active' : ''}`}>
                      <div className="step-icon">✅</div>
                      <div className="step-content">
                        <div className="step-title">Fulfilled</div>
                        <div className="step-desc">Order completed and shipped</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="order-section">
              <h4>Items Ordered</h4>
              <div className="items-list">
                {result.line_items.map((item, index) => (
                  <div key={index} className="order-item">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="item-image"
                      />
                    )}
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      {item.variant_title && (
                        <div className="item-variant">{item.variant_title}</div>
                      )}
                      <div className="item-quantity">Quantity: {item.quantity}</div>
                    </div>
                    <div className="item-price">
                      {result.currency} {item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.shipping_address && (
              <div className="order-section">
                <h4>Shipping Address</h4>
                <div className="shipping-address">
                  <p>
                    {result.shipping_address.first_name} {result.shipping_address.last_name}
                  </p>
                  <p>{result.shipping_address.address1}</p>
                  {result.shipping_address.address2 && <p>{result.shipping_address.address2}</p>}
                  <p>
                    {result.shipping_address.city}, {result.shipping_address.province} {result.shipping_address.zip}
                  </p>
                  <p>{result.shipping_address.country}</p>
                  {result.shipping_address.phone && <p>Phone: {result.shipping_address.phone}</p>}
                </div>
              </div>
            )}

            {result.fulfillments && result.fulfillments.length > 0 && (
              <div className="order-section">
                <h4>Tracking Information</h4>
                {result.fulfillments.map((fulfillment, index) => (
                  <div key={index} className="tracking-info">
                    {fulfillment.tracking_number && (
                      <p><strong>Tracking Number:</strong> {fulfillment.tracking_number}</p>
                    )}
                    {fulfillment.tracking_company && (
                      <p><strong>Carrier:</strong> {fulfillment.tracking_company}</p>
                    )}
                    <p><strong>Status:</strong> {fulfillment.status}</p>
                    {fulfillment.tracking_url && (
                      <p>
                        <a href={fulfillment.tracking_url} target="_blank" rel="noopener noreferrer">
                          Track Package
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          min-height: 100vh;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .logo {
          font-size: 3rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header h1 {
          color: #2c3e50;
          margin: 0;
          font-size: 2.2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header h2 {
          color: #2c3e50;
          margin: 0 0 15px 0;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .header p {
          color: #6c757d;
          font-size: 1.1rem;
          margin: 0;
          line-height: 1.6;
        }

        .form-container {
          margin-bottom: 30px;
        }

        .order-form {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .form-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .form-header h3 {
          color: #2c3e50;
          margin: 0 0 10px 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .form-header p {
          color: #6c757d;
          margin: 0;
          font-size: 1rem;
        }

        .form-fields {
          display: grid;
          gap: 25px;
          margin-bottom: 30px;
        }

        .form-group {
          position: relative;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-weight: 600;
          color: #495057;
          font-size: 0.95rem;
        }

        .label-icon {
          font-size: 1.1rem;
        }

        .form-group input {
          width: 100%;
          padding: 18px 20px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }

        .form-group input::placeholder {
          color: #adb5bd;
        }

        .submit-btn {
          width: 100%;
          padding: 18px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        .btn-text {
          font-weight: 600;
        }

        .error-message {
          background: rgba(248, 215, 218, 0.95);
          backdrop-filter: blur(10px);
          color: #721c24;
          padding: 25px;
          border-radius: 16px;
          margin-bottom: 30px;
          border-left: 5px solid #dc3545;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 10px 30px rgba(220, 53, 69, 0.1);
        }

        .error-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .error-content h4 {
          margin: 0 0 8px 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .error-content p {
          margin: 0;
          font-size: 1rem;
          line-height: 1.5;
        }

        .order-info {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeIn 0.6s ease-out;
        }

        .order-header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e9ecef;
        }

        .order-header-section h3 {
          color: #2c3e50;
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }


        .order-header {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
          padding: 25px;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .order-detail {
          text-align: center;
        }

        .order-detail .label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .order-detail .value {
          font-size: 16px;
          font-weight: 700;
          color: #2c3e50;
        }

        .status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          text-transform: uppercase;
        }

        .status.paid {
          background: #d4edda;
          color: #155724;
        }

        .status.pending {
          background: #fff3cd;
          color: #856404;
        }

        .status.received {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status.production {
          background: #f8d7da;
          color: #721c24;
        }

        .status.stitching {
          background: #d4edda;
          color: #155724;
        }

        .status.finishing {
          background: #fff3cd;
          color: #856404;
        }

        .status.dispatched {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status.processing {
          background: #e2e3e5;
          color: #383d41;
        }

        .status.fulfilled {
          background: #d4edda;
          color: #155724;
        }

        .status.partial {
          background: #fff3cd;
          color: #856404;
        }

        .order-section {
          margin-bottom: 30px;
        }

        .progress-timeline {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 25px;
          position: relative;
        }

        .timeline-step {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          border-radius: 16px;
          transition: all 0.4s ease;
          position: relative;
          z-index: 2;
        }

        .timeline-step:not(:last-child)::after {
          content: '↓';
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.5rem;
          color: #dee2e6;
          z-index: 3;
          background: rgba(255, 255, 255, 0.9);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .timeline-step.completed:not(:last-child)::after {
          color: #28a745;
          background: rgba(40, 167, 69, 0.1);
        }

        .timeline-step.active:not(:last-child)::after {
          color: #ffc107;
          background: rgba(255, 193, 7, 0.1);
          animation: bounce 1.5s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-3px); }
          60% { transform: translateX(-50%) translateY(-2px); }
        }

        .timeline-step.completed {
          background: linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.05));
          border: 2px solid rgba(40, 167, 69, 0.3);
          box-shadow: 0 8px 25px rgba(40, 167, 69, 0.15);
        }

        .timeline-step.active {
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 193, 7, 0.05));
          border: 2px solid rgba(255, 193, 7, 0.4);
          box-shadow: 0 12px 30px rgba(255, 193, 7, 0.25);
          transform: scale(1.02);
        }

        .timeline-step:not(.completed):not(.active) {
          background: rgba(248, 249, 250, 0.8);
          border: 2px solid rgba(222, 226, 230, 0.5);
          opacity: 0.7;
        }

        .step-icon {
          font-size: 1.5rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 3px solid #fff;
          flex-shrink: 0;
        }

        .timeline-step.completed .step-icon {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }

        .timeline-step.active .step-icon {
          background: linear-gradient(135deg, #ffc107, #fd7e14);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .step-content {
          flex: 1;
        }

        .step-title {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 6px;
          font-size: 1.1rem;
        }

        .step-desc {
          font-size: 0.9rem;
          color: #6c757d;
          line-height: 1.4;
        }

        .timeline-step.active .step-title {
          color: #856404;
        }

        .timeline-step.completed .step-title {
          color: #155724;
        }

        .order-section h4 {
          color: #2c3e50;
          margin-bottom: 15px;
          font-size: 1.2rem;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }

        .item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }

        .item-variant {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 4px;
        }

        .item-quantity {
          font-size: 14px;
          color: #495057;
        }

        .item-price {
          font-weight: 600;
          color: #2c3e50;
        }

        .shipping-address {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }

        .shipping-address p {
          margin: 5px 0;
          color: #495057;
        }

        .tracking-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .tracking-info p {
          margin: 5px 0;
          color: #495057;
        }

        .tracking-info a {
          color: #007bff;
          text-decoration: none;
        }

        .tracking-info a:hover {
          text-decoration: underline;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }

          .header {
            padding: 30px 20px;
            margin-bottom: 30px;
          }

          .header h1 {
            font-size: 1.8rem;
          }

          .header h2 {
            font-size: 1.5rem;
          }

          .order-form {
            padding: 30px 20px;
          }

          .form-fields {
            gap: 20px;
          }

          .order-header-section {
            text-align: center;
          }

          .order-header {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 20px;
          }

          .order-info {
            padding: 30px 20px;
          }

          .order-item {
            flex-wrap: wrap;
          }

          .progress-timeline {
            gap: 12px;
          }

          .timeline-step {
            padding: 15px;
            gap: 15px;
          }

          .timeline-step:not(:last-child)::after {
            bottom: -20px;
            width: 25px;
            height: 25px;
            font-size: 1.2rem;
          }

          .step-icon {
            font-size: 1.2rem;
            width: 40px;
            height: 40px;
          }

          .step-title {
            font-size: 1rem;
          }

          .step-desc {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 10px;
          }

          .header {
            padding: 25px 15px;
          }

          .header h1 {
            font-size: 1.6rem;
          }

          .logo-section {
            flex-direction: column;
            gap: 10px;
          }

          .order-form {
            padding: 25px 15px;
          }

          .order-info {
            padding: 25px 15px;
          }

          .timeline-step {
            padding: 12px;
            gap: 12px;
          }

          .timeline-step:not(:last-child)::after {
            bottom: -18px;
            width: 22px;
            height: 22px;
            font-size: 1rem;
          }

          .step-icon {
            width: 35px;
            height: 35px;
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
