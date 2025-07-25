// Dashboard endpoint to show recent API activity
// This helps you monitor what's happening with your APIs

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dashboard = {
      timestamp: new Date().toISOString(),
      status: 'API Dashboard is running',
      endpoints: {
        'KYC Form Submission': {
          url: '/api/camunda/submit-kyc',
          method: 'POST',
          description: 'Receives KYC form data and sends to Camunda',
          status: '✅ Active'
        },
        'Receive Task Data': {
          url: '/api/camunda/receive-task-data',
          method: 'GET/POST',
          description: 'Receives data from Camunda (reverse flow)',
          status: '✅ Active'
        },
        'Test Endpoint': {
          url: '/api/test',
          method: 'GET/POST',
          description: 'Simple connectivity test',
          status: '✅ Active'
        }
      },
      instructions: {
        'To see API logs': 'Check Vercel Function Logs in your Vercel dashboard',
        'To test connectivity': 'Call GET /api/test from Camunda',
        'To test data flow': 'Call POST /api/camunda/receive-task-data from Camunda',
        'To submit KYC form': 'Use the frontend with ?taskId=your-task-id'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        camundaUrl: process.env.CAMUNDA_BASE_URL || 'Not set'
      }
    };

    res.status(200).json(dashboard);

  } catch (error) {
    console.error('Error in dashboard:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Dashboard error',
      timestamp: new Date().toISOString()
    });
  }
} 