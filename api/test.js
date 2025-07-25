// Simple test endpoint for Camunda to verify connectivity
// This can be used to test if Camunda can reach your external API

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('=== TEST ENDPOINT CALLED ===');
    console.log('Method:', req.method);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);
    console.log('Body:', req.body);

    // Return a simple success response
    res.status(200).json({
      success: true,
      message: 'Test endpoint is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      query: req.query,
      body: req.body,
      headers: req.headers,
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    console.error('Error in test endpoint:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Test endpoint error',
      timestamp: new Date().toISOString()
    });
  }
} 