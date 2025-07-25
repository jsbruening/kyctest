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
    const requestId = Math.random().toString(36).substring(7);
    
    console.log(`🚀 [${requestId}] === CAMUNDA -> EXTERNAL API TEST ===`);
    console.log(`📅 [${requestId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`🔗 [${requestId}] Method: ${req.method}`);
    console.log(`🌐 [${requestId}] URL: ${req.url}`);
    console.log(`📋 [${requestId}] Headers:`, req.headers);
    console.log(`🔍 [${requestId}] Query params:`, req.query);
    console.log(`📦 [${requestId}] Body:`, req.body);

    // For GET requests, return a test response
    if (req.method === 'GET') {
      console.log(`✅ [${requestId}] GET request - returning test response`);
      return res.status(200).json({
        success: true,
        message: 'External API endpoint is working',
        requestId: requestId,
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
      requestId: requestId,
      timestamp: new Date().toISOString(),
      taskId,
      processInstanceId,
      businessKey,
      variables,
      formData,
      otherData,
      headers: req.headers
    };

    console.log(`📥 [${requestId}] Received data from Camunda:`, JSON.stringify(logData, null, 2));
    console.log(`✅ [${requestId}] Data processing completed successfully`);

    // Store the data (in a real scenario, you might save to a database)
    // For now, we'll just log it and return a success response

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Data received successfully from Camunda',
      requestId: requestId,
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
    console.error('❌ Error processing data from Camunda:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to process data from Camunda',
      timestamp: new Date().toISOString()
    });
  }
} 