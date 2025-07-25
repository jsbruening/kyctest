# Camunda KYC Form

A React-based KYC (Know Your Customer) form that integrates with Camunda workflows. This form collects comprehensive customer information with conditional logic based on responses.

## Features

- **Comprehensive KYC Form**: 6 sections covering all aspects of customer identification
- **Conditional Logic**: Dynamic form fields based on user responses
- **Camunda Integration**: Sends form data back to Camunda workflow instances
- **TypeScript**: Full type safety for form data
- **Responsive Design**: Works on desktop and mobile devices

## Form Sections

1. **Basic Customer Identification**: Individual vs Entity, personal details, ID verification
2. **Beneficial Ownership**: For legal entities, ownership structure and control persons
3. **Nature of Relationship**: Account purpose and business details
4. **Sanctions & Geographic Risk**: OFAC compliance and international activity
5. **Source of Funds**: Income verification and business revenue details
6. **Ongoing Monitoring**: Risk assessment and monitoring triggers

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the form

## Usage

### With Camunda

1. Start a workflow in Camunda UI
2. Navigate to the form with the process instance ID:
   ```
   http://localhost:3000?processInstanceId=YOUR_PROCESS_INSTANCE_ID
   ```
3. Fill out the form
4. Submit - data will be sent back to Camunda

### API Integration

The form submits data to `/api/camunda/submit-kyc` with the following structure:

```json
{
  "processInstanceId": "string",
  "formData": {
    "customerType": "individual|entity",
    "individual": { /* individual customer data */ },
    "entity": { /* entity customer data */ },
    "beneficialOwnership": { /* ownership information */ },
    "relationship": { /* account purpose and details */ },
    "sanctions": { /* OFAC and geographic risk */ },
    "sourceOfFunds": { /* income verification */ },
    "ongoingMonitoring": { /* risk assessment */ }
  }
}
```

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set up environment variables in Vercel dashboard

### Environment Variables

Create a `.env` file for local development:

```
REACT_APP_CAMUNDA_API_URL=http://localhost:8080/engine-rest
```

## Customization

### Adding New Form Fields

1. Update the TypeScript types in `src/types.ts`
2. Add form fields in `src/App.tsx`
3. Update validation rules as needed

### Styling

- Main styles: `src/index.css`
- Component-specific styles: `src/App.css`

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Project Structure

```
src/
├── App.tsx          # Main form component
├── App.css          # Component styles
├── index.tsx        # App entry point
├── index.css        # Global styles
└── types.ts         # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 