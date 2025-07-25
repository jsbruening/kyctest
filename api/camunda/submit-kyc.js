// Vercel serverless function for KYC form submission
// This file will be deployed as /api/camunda/submit-kyc

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { taskId, formData } = req.body;

    // Validate required fields
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    if (!formData) {
      return res.status(400).json({ error: 'Form data is required' });
    }

    console.log('Received KYC submission:', { taskId, formData });

    // TODO: Replace with your actual Camunda server URL
    const CAMUNDA_BASE_URL = process.env.CAMUNDA_BASE_URL || 'http://localhost:8080/engine-rest';
    
    // Complete the external task in Camunda
    const camundaResponse = await fetch(`${CAMUNDA_BASE_URL}/external-task/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workerId: 'kyc-form-worker',
        variables: {
          // Convert form data to Camunda variables
          customerType: { value: formData.customerType, type: 'String' },
          
          // Individual data
          ...(formData.individual && {
            fullName: { value: formData.individual.fullName, type: 'String' },
            dateOfBirth: { value: formData.individual.dateOfBirth, type: 'String' },
            residentialAddress: { value: formData.individual.residentialAddress, type: 'String' },
            nationality: { value: formData.individual.nationality, type: 'String' },
            usPerson: { value: formData.individual.usPerson, type: 'Boolean' },
            ...(formData.individual.ssn && { ssn: { value: formData.individual.ssn, type: 'String' } }),
            ...(formData.individual.alienRegistrationNumber && { 
              alienRegistrationNumber: { value: formData.individual.alienRegistrationNumber, type: 'String' } 
            }),
            idType: { value: formData.individual.idType, type: 'String' },
          }),

          // Entity data
          ...(formData.entity && {
            legalName: { value: formData.entity.legalName, type: 'String' },
            entityType: { value: formData.entity.entityType, type: 'String' },
            registrationNumber: { value: formData.entity.registrationNumber, type: 'String' },
            businessAddress: { value: formData.entity.businessAddress, type: 'String' },
          }),

          // Beneficial ownership
          hasOwners: { value: formData.beneficialOwnership.hasOwners, type: 'Boolean' },
          ...(formData.beneficialOwnership.owners && {
            owners: { value: JSON.stringify(formData.beneficialOwnership.owners), type: 'String' }
          }),
          ...(formData.beneficialOwnership.controlPerson && {
            controlPerson: { value: JSON.stringify(formData.beneficialOwnership.controlPerson), type: 'String' }
          }),

          // Relationship
          purpose: { value: formData.relationship.purpose, type: 'String' },
          ...(formData.relationship.businessDetails && {
            businessDetails: { value: JSON.stringify(formData.relationship.businessDetails), type: 'String' }
          }),

          // Sanctions
          sanctionedJurisdiction: { value: formData.sanctions.sanctionedJurisdiction, type: 'Boolean' },
          ...(formData.sanctions.sanctionedJurisdictionDetails && {
            sanctionedJurisdictionDetails: { value: JSON.stringify(formData.sanctions.sanctionedJurisdictionDetails), type: 'String' }
          }),
          foreignBeneficialOwners: { value: formData.sanctions.foreignBeneficialOwners, type: 'Boolean' },
          ...(formData.sanctions.foreignBeneficialOwnersDetails && {
            foreignBeneficialOwnersDetails: { value: JSON.stringify(formData.sanctions.foreignBeneficialOwnersDetails), type: 'String' }
          }),
          internationalWires: { value: formData.sanctions.internationalWires, type: 'Boolean' },
          ...(formData.sanctions.internationalWiresDetails && {
            internationalWiresDetails: { value: JSON.stringify(formData.sanctions.internationalWiresDetails), type: 'String' }
          }),

          // Source of funds
          sourceOfFunds: { value: formData.sourceOfFunds.source, type: 'String' },
          ...(formData.sourceOfFunds.otherSource && {
            otherSource: { value: formData.sourceOfFunds.otherSource, type: 'String' }
          }),
          ...(formData.sourceOfFunds.businessRevenuesDetails && {
            businessRevenuesDetails: { value: JSON.stringify(formData.sourceOfFunds.businessRevenuesDetails), type: 'String' }
          }),

          // Ongoing monitoring
          thirdPartyFunding: { value: formData.ongoingMonitoring.thirdPartyFunding, type: 'Boolean' },
          ...(formData.ongoingMonitoring.thirdPartyFundingDetails && {
            thirdPartyFundingDetails: { value: JSON.stringify(formData.ongoingMonitoring.thirdPartyFundingDetails), type: 'String' }
          }),
          largeCashActivity: { value: formData.ongoingMonitoring.largeCashActivity, type: 'Boolean' },
          ...(formData.ongoingMonitoring.largeCashActivityDetails && {
            largeCashActivityDetails: { value: JSON.stringify(formData.ongoingMonitoring.largeCashActivityDetails), type: 'String' }
          }),
          foreignBeneficialOwnersOrPEPs: { value: formData.ongoingMonitoring.foreignBeneficialOwnersOrPEPs, type: 'Boolean' },
          ...(formData.ongoingMonitoring.foreignBeneficialOwnersOrPEPsDetails && {
            foreignBeneficialOwnersOrPEPsDetails: { value: JSON.stringify(formData.ongoingMonitoring.foreignBeneficialOwnersOrPEPsDetails), type: 'String' }
          }),

          // Store complete form data as JSON for backup
          completeFormData: { value: JSON.stringify(formData), type: 'String' },
        }
      })
    });

    if (!camundaResponse.ok) {
      const errorText = await camundaResponse.text();
      console.error('Camunda API error:', errorText);
      throw new Error(`Camunda API error: ${camundaResponse.status} - ${errorText}`);
    }

    const result = await camundaResponse.json();
    console.log('Camunda task completed successfully:', result);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'KYC form submitted successfully',
      taskId: taskId,
      camundaResponse: result
    });

  } catch (error) {
    console.error('Error processing KYC submission:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to submit KYC form'
    });
  }
} 