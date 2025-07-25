# Deployment Instructions

## Vercel Deployment

This project is configured to deploy to Vercel with both frontend and backend API.

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or deploy to production
vercel --prod
```

### 2. Environment Variables

Set these environment variables in your Vercel dashboard:

- `CAMUNDA_BASE_URL`: Your Camunda server URL (e.g., `https://your-camunda-server.com/engine-rest`)

### 3. API Endpoints

After deployment, your APIs will be available at:

#### KYC Form Submission
- `https://your-app.vercel.app/api/camunda/submit-kyc` - Submit KYC form data to Camunda

#### Camunda -> External API Testing
- `https://your-app.vercel.app/api/camunda/receive-task-data` - Receive data from Camunda (for testing reverse flow)
- `https://your-app.vercel.app/api/test` - Simple test endpoint for connectivity verification

### 4. Camunda Integration

The API endpoint will:
1. Receive KYC form data from the frontend
2. Convert form data to Camunda variables
3. Complete the external task in Camunda
4. Return success/error response

### 5. Testing

#### Test KYC Form
Test the form with a task ID:
```
https://your-app.vercel.app/?taskId=your-task-id
```

#### Test API Endpoints
Test the API endpoints directly:

1. **Test endpoint** (GET/POST):
```
https://your-app.vercel.app/api/test
```

2. **Receive task data** (POST from Camunda):
```
https://your-app.vercel.app/api/camunda/receive-task-data
```

#### Camunda HTTP Task Configuration
In your Camunda process, you can add an HTTP task to call your external API:

```xml
<bpmn:serviceTask id="call-external-api" name="Call External API">
  <bpmn:extensionElements>
    <camunda:connector>
      <camunda:inputOutput>
        <camunda:input name="url">https://your-app.vercel.app/api/camunda/receive-task-data</camunda:input>
        <camunda:input name="method">POST</camunda:input>
        <camunda:input name="headers">
          <camunda:map>
            <camunda:entry key="Content-Type">application/json</camunda:entry>
          </camunda:map>
        </camunda:input>
        <camunda:input name="payload">${taskId}</camunda:input>
      </camunda:inputOutput>
      <camunda:connectorId>http-connector</camunda:connectorId>
    </camunda:connector>
  </bpmn:extensionElements>
</bpmn:serviceTask>
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run linting
npm run lint
```

## Camunda Setup

1. Create an external task in your Camunda process
2. Set the topic name (e.g., "kyc-form-task")
3. Configure the external task to wait for completion
4. The form will complete the task with all form data as variables

## Troubleshooting

- Check Vercel function logs for API errors
- Ensure Camunda server is accessible from Vercel
- Verify environment variables are set correctly
- Test with a valid task ID from your Camunda process 