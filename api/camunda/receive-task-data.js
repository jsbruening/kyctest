// Vercel serverless function for receiving task data from Camunda
// This endpoint can be called by Camunda to test the reverse flow
// Camunda -> External API -> This endpoint

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Allow both GET and POST for testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== CAMUNDA -> EXTERNAL API TEST ===');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Query params:', req.query);
    console.log('Body:', req.body);
    console.log('Timestamp:', new Date().toISOString());

    // For GET requests, return a test response
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'External API endpoint is working',
        timestamp: new Date().toISOString(),
        method: 'GET',
        query: req.query,
        headers: req.headers
      });
    }

    // For POST requests, process the data
    const { 
      taskId, 
      processInstanceId, 
      businessKey,
      variables,
      formData,
      ...otherData 
    } = req.body;

    // Log the received data
    const logData = {
      timestamp: new Date().toISOString(),
      taskId,
      processInstanceId,
      businessKey,
      variables,
      formData,
      otherData,
      headers: req.headers
    };

    console.log('Received data from Camunda:', JSON.stringify(logData, null, 2));

    // Store the data (in a real scenario, you might save to a database)
    // For now, we'll just log it and return a success response

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Data received successfully from Camunda',
      receivedAt: new Date().toISOString(),
      dataReceived: {
        taskId,
        processInstanceId,
        businessKey,
        variableCount: variables ? Object.keys(variables).length : 0,
        hasFormData: !!formData
      },
      // Echo back some data for verification
      echo: {
        taskId,
        processInstanceId,
        businessKey
      }
    });

  } catch (error) {
    console.error('Error processing data from Camunda:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to process data from Camunda',
      timestamp: new Date().toISOString()
    });
  }
} 