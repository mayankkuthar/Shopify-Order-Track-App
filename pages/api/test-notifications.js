export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey } = req.body;
    
    if (apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Call the email notifications API
    const response = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/email-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    const result = await response.json();

    res.status(response.status).json(result);
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
