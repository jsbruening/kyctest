import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KYCFormData } from './types';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
 const [processInstanceId, setProcessInstanceId] = useState<string>('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isSubmitted, setIsSubmitted] = useState(false);
 const [error, setError] = useState<string>('');

 const {
  register,
  handleSubmit,
  watch,
  formState: { errors }
 } = useForm<KYCFormData['formData']>();

 // Watch form values for conditional rendering
 const customerType = watch('customerType');
 const usPerson = watch('individual.usPerson');
 const idType = watch('individual.idType');
 const hasOwners = watch('beneficialOwnership.hasOwners');
 const purpose = watch('relationship.purpose');
 const internationalTransactions = watch('relationship.businessDetails.internationalTransactions');
 const sanctionedJurisdiction = watch('sanctions.sanctionedJurisdiction');
 const foreignBeneficialOwners = watch('sanctions.foreignBeneficialOwners');
 const internationalWires = watch('sanctions.internationalWires');
 const source = watch('sourceOfFunds.source');
 const thirdPartyFunding = watch('ongoingMonitoring.thirdPartyFunding');
 const largeCashActivity = watch('ongoingMonitoring.largeCashActivity');
 const foreignBeneficialOwnersOrPEPs = watch('ongoingMonitoring.foreignBeneficialOwnersOrPEPs');

 useEffect(() => {
  // Get process instance ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('processInstanceId');
  if (id) {
   setProcessInstanceId(id);
   toast.success(`Connected to process instance: ${id}`);
  } else {
   setError('No process instance ID provided in URL');
  }
 }, []);

 const onSubmit = async (data: KYCFormData['formData']) => {
  if (!processInstanceId) {
   toast.error('No process instance ID available');
   return;
  }

  setIsSubmitting(true);
  setError('');

  toast.loading('Preparing to submit KYC form...', { id: 'submit-kyc' });

  const submitPromise = new Promise(async (resolve, reject) => {
   try {
    const formData: KYCFormData = {
     processInstanceId,
     formData: data
    };

    // TODO: Replace with your Camunda API endpoint
    const response = await fetch('/api/camunda/submit-kyc', {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
     },
     body: JSON.stringify(formData),
    });

    if (!response.ok) {
     throw new Error(`HTTP error! status: ${response.status}`);
    }

    setIsSubmitted(true);
    resolve('Form submitted successfully!');
   } catch (err) {
    reject(err instanceof Error ? err.message : 'Failed to submit form');
   } finally {
    setIsSubmitting(false);
   }
  });

  toast.promise(submitPromise, {
   loading: 'Submitting KYC form...',
   success: () => {
    toast.dismiss('submit-kyc');
    return 'KYC form submitted successfully!';
   },
   error: (err) => {
    toast.dismiss('submit-kyc');
    return `Submission failed: ${err}`;
   },
  });
 };

 const [enteredProcessId, setEnteredProcessId] = useState<string>('');
 const [isRedirecting, setIsRedirecting] = useState(false);

 const handleProcessIdSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (enteredProcessId.trim()) {
   setIsRedirecting(true);
   toast.loading('Redirecting to KYC form...', { id: 'redirect' });

   const currentUrl = new URL(window.location.href);
   currentUrl.searchParams.set('processInstanceId', enteredProcessId.trim());
   window.location.href = currentUrl.toString();
  } else {
   toast.error('Please enter a process instance ID');
  }
 };

 if (error && !processInstanceId) {
  return (
   <div className="container">
    <Toaster
     position="top-right"
     toastOptions={{
      duration: 4000,
      style: {
       background: '#363636',
       color: '#fff',
      },
      error: {
       duration: 5000,
       iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
       },
      },
     }}
    />

    <div className="text-center">
     <h1 className="text-3xl font-bold text-gray-800 mb-6">KYC Form</h1>
     <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Enter Process Instance ID</h2>
      <p className="text-gray-600 mb-6">Please provide the process instance ID to continue with the KYC form.</p>

      <form onSubmit={handleProcessIdSubmit} className="space-y-4">
       <div>
        <label htmlFor="processId" className="block text-sm font-medium text-gray-700 mb-2">
         Process Instance ID
        </label>
        <input
         type="text"
         id="processId"
         value={enteredProcessId}
         onChange={(e) => setEnteredProcessId(e.target.value)}
         placeholder="Enter process instance ID"
         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         required
        />
       </div>

       <button
        type="submit"
        disabled={isRedirecting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
       >
        {isRedirecting ? 'Redirecting...' : 'Continue to KYC Form'}
       </button>
      </form>
     </div>
    </div>
   </div>
  );
 }

 if (isSubmitted) {
  return (
   <div className="container">
    <Toaster
     position="top-right"
     toastOptions={{
      duration: 4000,
      style: {
       background: '#363636',
       color: '#fff',
      },
      success: {
       duration: 3000,
       iconTheme: {
        primary: '#4ade80',
        secondary: '#fff',
       },
      },
     }}
    />
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
     <h2 className="text-2xl font-bold text-green-800 mb-4">Thank you!</h2>
     <p className="text-green-700 mb-2">Your KYC information has been successfully submitted to Camunda.</p>
     <p className="text-sm text-green-600">Process Instance ID: <span className="font-mono bg-green-100 px-2 py-1 rounded">{processInstanceId}</span></p>
    </div>
   </div>
  );
 }

 return (
  <div className="container">
   <Toaster
    position="top-right"
    toastOptions={{
     duration: 4000,
     style: {
      background: '#363636',
      color: '#fff',
     },
     success: {
      duration: 3000,
      iconTheme: {
       primary: '#4ade80',
       secondary: '#fff',
      },
     },
     error: {
      duration: 5000,
      iconTheme: {
       primary: '#ef4444',
       secondary: '#fff',
      },
     },
    }}
   />

   <h1 className="text-3xl font-bold text-gray-800 mb-4">KYC Form</h1>
   <p className="text-sm text-gray-600 mb-6">Process Instance ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{processInstanceId}</span></p>

   <form onSubmit={handleSubmit(onSubmit, (errors) => {
    // Show validation errors as toasts
    const errorMessages = Object.values(errors).map(error => error?.message).filter(Boolean);
    if (errorMessages.length > 0) {
     toast.error(`Please fix the following errors: ${errorMessages.join(', ')}`);
    }
   })}>
    {/* Section 1: Basic Customer Identification */}
    <div className="form-section">
     <h3>Section 1: Basic Customer Identification</h3>

     <div className="form-group">
      <label>Are you onboarding an individual or a legal entity?</label>
      <div className="radio-group">
       <label>
        <input
         type="radio"
         value="individual"
         {...register('customerType', { required: 'Please select customer type' })}
        />
        Individual
       </label>
       <label>
        <input
         type="radio"
         value="entity"
         {...register('customerType', { required: 'Please select customer type' })}
        />
        Legal Entity
       </label>
      </div>
      {errors.customerType && <div className="error">{errors.customerType.message}</div>}
     </div>

     {customerType === 'individual' && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Full Legal Name</label>
        <input
         type="text"
         {...register('individual.fullName', { required: 'Full name is required' })}
        />
        {errors.individual?.fullName && <div className="error">{errors.individual.fullName.message}</div>}
       </div>

       <div className="form-group">
        <label>Date of Birth</label>
        <input
         type="date"
         {...register('individual.dateOfBirth', { required: 'Date of birth is required' })}
        />
        {errors.individual?.dateOfBirth && <div className="error">{errors.individual.dateOfBirth.message}</div>}
       </div>

       <div className="form-group">
        <label>Residential Address</label>
        <textarea
         {...register('individual.residentialAddress', { required: 'Address is required' })}
        />
        {errors.individual?.residentialAddress && <div className="error">{errors.individual.residentialAddress.message}</div>}
       </div>

       <div className="form-group">
        <label>Nationality / Citizenship</label>
        <input
         type="text"
         {...register('individual.nationality', { required: 'Nationality is required' })}
        />
        {errors.individual?.nationality && <div className="error">{errors.individual.nationality.message}</div>}
       </div>

       <div className="form-group">
        <label>U.S. Person?</label>
        <div className="radio-group">
         <label>
          <input
           type="radio"
           value="true"
           {...register('individual.usPerson', { required: 'Please select U.S. person status' })}
          />
          Yes
         </label>
         <label>
          <input
           type="radio"
           value="false"
           {...register('individual.usPerson', { required: 'Please select U.S. person status' })}
          />
          No
         </label>
        </div>
        {errors.individual?.usPerson && <div className="error">{errors.individual.usPerson.message}</div>}
       </div>

       {usPerson === true && (
        <div className="conditional-section">
         <div className="form-group">
          <label>SSN</label>
          <input
           type="text"
           placeholder="XXX-XX-XXXX"
           {...register('individual.ssn', { required: 'SSN is required for U.S. persons' })}
          />
          {errors.individual?.ssn && <div className="error">{errors.individual.ssn.message}</div>}
         </div>
        </div>
       )}

       {usPerson === false && (
        <div className="conditional-section">
         <div className="form-group">
          <label>Alien Registration Number or Passport Details</label>
          <input
           type="text"
           {...register('individual.alienRegistrationNumber', { required: 'Alien registration number is required for non-U.S. persons' })}
          />
          {errors.individual?.alienRegistrationNumber && <div className="error">{errors.individual.alienRegistrationNumber.message}</div>}
         </div>
        </div>
       )}

       <div className="form-group">
        <label>Type of ID Provided</label>
        <select {...register('individual.idType', { required: 'Please select ID type' })}>
         <option value="">Select ID Type</option>
         <option value="driverLicense">Driver&apos;s License</option>
         <option value="passport">Passport</option>
         <option value="other">Other</option>
        </select>
        {errors.individual?.idType && <div className="error">{errors.individual.idType.message}</div>}
       </div>

       {idType === 'driverLicense' && (
        <div className="conditional-section">
         <div className="form-group">
          <label>License Number</label>
          <input
           type="text"
           {...register('individual.driverLicense.number', { required: 'License number is required' })}
          />
         </div>
         <div className="form-group">
          <label>Issuing State</label>
          <input
           type="text"
           {...register('individual.driverLicense.issuingState', { required: 'Issuing state is required' })}
          />
         </div>
         <div className="form-group">
          <label>Expiration Date</label>
          <input
           type="date"
           {...register('individual.driverLicense.expirationDate', { required: 'Expiration date is required' })}
          />
         </div>
        </div>
       )}

       {idType === 'passport' && (
        <div className="conditional-section">
         <div className="form-group">
          <label>Passport Number</label>
          <input
           type="text"
           {...register('individual.passportDetails.number', { required: 'Passport number is required' })}
          />
         </div>
         <div className="form-group">
          <label>Issuing Country</label>
          <input
           type="text"
           {...register('individual.passportDetails.issuingCountry', { required: 'Issuing country is required' })}
          />
         </div>
         <div className="form-group">
          <label>Expiration Date</label>
          <input
           type="date"
           {...register('individual.passportDetails.expirationDate', { required: 'Expiration date is required' })}
          />
         </div>
        </div>
       )}

       {idType === 'other' && (
        <div className="conditional-section">
         <div className="form-group">
          <label>ID Type</label>
          <input
           type="text"
           {...register('individual.otherId.type', { required: 'ID type is required' })}
          />
         </div>
         <div className="form-group">
          <label>Issuing Authority</label>
          <input
           type="text"
           {...register('individual.otherId.issuingAuthority', { required: 'Issuing authority is required' })}
          />
         </div>
         <div className="form-group">
          <label>ID Number</label>
          <input
           type="text"
           {...register('individual.otherId.number', { required: 'ID number is required' })}
          />
         </div>
         <div className="form-group">
          <label>Expiration Date</label>
          <input
           type="date"
           {...register('individual.otherId.expirationDate', { required: 'Expiration date is required' })}
          />
         </div>
        </div>
       )}
      </div>
     )}

     {customerType === 'entity' && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Legal Name</label>
        <input
         type="text"
         {...register('entity.legalName', { required: 'Legal name is required' })}
        />
        {errors.entity?.legalName && <div className="error">{errors.entity.legalName.message}</div>}
       </div>

       <div className="form-group">
        <label>Entity Type</label>
        <input
         type="text"
         {...register('entity.entityType', { required: 'Entity type is required' })}
        />
        {errors.entity?.entityType && <div className="error">{errors.entity.entityType.message}</div>}
       </div>

       <div className="form-group">
        <label>Registration Number</label>
        <input
         type="text"
         {...register('entity.registrationNumber', { required: 'Registration number is required' })}
        />
        {errors.entity?.registrationNumber && <div className="error">{errors.entity.registrationNumber.message}</div>}
       </div>

       <div className="form-group">
        <label>Business Address</label>
        <textarea
         {...register('entity.businessAddress', { required: 'Business address is required' })}
        />
        {errors.entity?.businessAddress && <div className="error">{errors.entity.businessAddress.message}</div>}
       </div>
      </div>
     )}
    </div>

    {/* Section 2: Beneficial Ownership */}
    <div className="form-section">
     <h3>Section 2: Beneficial Ownership (for Legal Entities)</h3>

     <div className="form-group">
      <label>Does this legal entity have any individuals owning 25% or more? (FinCEN Rule)</label>
      <div className="radio-group">
       <label>
        <input
         type="radio"
         value="true"
         {...register('beneficialOwnership.hasOwners', { required: 'Please select ownership status' })}
        />
        Yes
       </label>
       <label>
        <input
         type="radio"
         value="false"
         {...register('beneficialOwnership.hasOwners', { required: 'Please select ownership status' })}
        />
        No
       </label>
      </div>
      {errors.beneficialOwnership?.hasOwners && <div className="error">{errors.beneficialOwnership.hasOwners.message}</div>}
     </div>

     {hasOwners === true && (
      <div className="conditional-section">
       <p>For each owner (up to 4):</p>
       {/* TODO: Add dynamic beneficial owner form fields */}
       <div className="beneficial-owner">
        <h4>Beneficial Owner 1</h4>
        <div className="form-group">
         <label>Name</label>
         <input
          type="text"
          {...register('beneficialOwnership.owners.0.name', { required: 'Owner name is required' })}
         />
        </div>
        <div className="form-group">
         <label>Date of Birth</label>
         <input
          type="date"
          {...register('beneficialOwnership.owners.0.dateOfBirth', { required: 'Date of birth is required' })}
         />
        </div>
        <div className="form-group">
         <label>Address</label>
         <textarea
          {...register('beneficialOwnership.owners.0.address', { required: 'Address is required' })}
         />
        </div>
        <div className="form-group">
         <label>Ownership Percentage</label>
         <input
          type="number"
          min="0"
          max="100"
          {...register('beneficialOwnership.owners.0.ownershipPercentage', { required: 'Ownership percentage is required' })}
         />
        </div>
       </div>
      </div>
     )}

     {hasOwners === false && (
      <div className="conditional-section">
       <p>No individual owns 25% or more</p>
      </div>
     )}

     <div className="form-group">
      <label>Who is the Control Person? (e.g. CEO, President)</label>
      <div className="form-group">
       <label>Full Name</label>
       <input
        type="text"
        {...register('beneficialOwnership.controlPerson.name', { required: 'Control person name is required' })}
       />
      </div>
      <div className="form-group">
       <label>Title</label>
       <input
        type="text"
        {...register('beneficialOwnership.controlPerson.title', { required: 'Title is required' })}
       />
      </div>
      <div className="form-group">
       <label>Date of Birth</label>
       <input
        type="date"
        {...register('beneficialOwnership.controlPerson.dateOfBirth', { required: 'Date of birth is required' })}
       />
      </div>
      <div className="form-group">
       <label>Address</label>
       <textarea
        {...register('beneficialOwnership.controlPerson.address', { required: 'Address is required' })}
       />
      </div>
     </div>
    </div>

    {/* Section 3: Nature of Relationship */}
    <div className="form-section">
     <h3>Section 3: Nature of Relationship</h3>

     <div className="form-group">
      <label>What is the purpose of the account or relationship?</label>
      <select {...register('relationship.purpose', { required: 'Please select purpose' })}>
       <option value="">Select Purpose</option>
       <option value="personalBanking">Personal banking</option>
       <option value="businessOperating">Business operating account</option>
       <option value="tradeFinance">Trade finance</option>
       <option value="investments">Investments</option>
       <option value="escrow">Escrow</option>
       <option value="other">Other</option>
      </select>
      {errors.relationship?.purpose && <div className="error">{errors.relationship.purpose.message}</div>}
     </div>

     {purpose === 'businessOperating' && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Industry / NAICS code</label>
        <input
         type="text"
         {...register('relationship.businessDetails.industry', { required: 'Industry is required for business accounts' })}
        />
       </div>
       <div className="form-group">
        <label>Expected transaction types</label>
        <div className="radio-group">
         <label><input type="checkbox" value="ACH" {...register('relationship.businessDetails.transactionTypes')} /> ACH</label>
         <label><input type="checkbox" value="Wires" {...register('relationship.businessDetails.transactionTypes')} /> Wires</label>
         <label><input type="checkbox" value="Checks" {...register('relationship.businessDetails.transactionTypes')} /> Checks</label>
         <label><input type="checkbox" value="Cash Deposits" {...register('relationship.businessDetails.transactionTypes')} /> Cash Deposits</label>
        </div>
       </div>
       <div className="form-group">
        <label>Volume per month</label>
        <select {...register('relationship.businessDetails.monthlyVolume', { required: 'Monthly volume is required' })}>
         <option value="">Select Volume</option>
         <option value="<10k">Less than $10,000</option>
         <option value="10-50k">$10,000 - $50,000</option>
         <option value="50-250k">$50,000 - $250,000</option>
         <option value="250k+">$250,000+</option>
        </select>
       </div>
       <div className="form-group">
        <label>Any anticipated international transactions?</label>
        <div className="radio-group">
         <label>
          <input
           type="radio"
           value="true"
           {...register('relationship.businessDetails.internationalTransactions')}
          />
          Yes
         </label>
         <label>
          <input
           type="radio"
           value="false"
           {...register('relationship.businessDetails.internationalTransactions')}
          />
          No
         </label>
        </div>
       </div>
       {internationalTransactions === true && (
        <div className="conditional-section">
         <div className="form-group">
          <label>Which countries?</label>
          <textarea
           placeholder="List countries separated by commas"
           {...register('relationship.businessDetails.countries')}
          />
         </div>
        </div>
       )}
      </div>
     )}
    </div>

    {/* Section 4: Sanctions & Geographic Risk */}
    <div className="form-section">
     <h3>Section 4: Sanctions & Geographic Risk (OFAC-Specific Triggers)</h3>

     <div className="form-group">
      <label>Does the individual/entity reside in, operate from, or do business with a sanctioned jurisdiction?</label>
      <div className="radio-group">
       <label>
        <input
         type="radio"
         value="true"
         {...register('sanctions.sanctionedJurisdiction')}
        />
        Yes
       </label>
       <label>
        <input
         type="radio"
         value="false"
         {...register('sanctions.sanctionedJurisdiction')}
        />
        No
       </label>
      </div>
     </div>

     {sanctionedJurisdiction === true && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Describe nature of interaction</label>
        <textarea
         {...register('sanctions.sanctionedJurisdictionDetails.natureOfInteraction', { required: 'Nature of interaction is required' })}
        />
       </div>
       <div className="form-group">
        <label>Provide counterparties&apos; names for OFAC screening</label>
        <textarea
         placeholder="List counterparties separated by commas"
         {...register('sanctions.sanctionedJurisdictionDetails.counterparties')}
        />
       </div>
      </div>
     )}

     <div className="form-group">
      <label>Have beneficial owners located outside the U.S.?</label>
      <div className="radio-group">
       <label>
        <input
         type="radio"
         value="true"
         {...register('sanctions.foreignBeneficialOwners')}
        />
        Yes
       </label>
       <label>
        <input
         type="radio"
         value="false"
         {...register('sanctions.foreignBeneficialOwners')}
        />
        No
       </label>
      </div>
     </div>

     {foreignBeneficialOwners === true && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Country</label>
        <input
         type="text"
         {...register('sanctions.foreignBeneficialOwnersDetails.country', { required: 'Country is required' })}
        />
       </div>
       <div className="form-group">
        <label>Passport Number</label>
        <input
         type="text"
         {...register('sanctions.foreignBeneficialOwnersDetails.passportNumber', { required: 'Passport number is required' })}
        />
       </div>
       <div className="form-group">
        <label>Full Details</label>
        <textarea
         {...register('sanctions.foreignBeneficialOwnersDetails.details', { required: 'Details are required' })}
        />
       </div>
      </div>
     )}

     <div className="form-group">
      <label>Plan to send/receive international wires or ACH?</label>
      <div className="radio-group">
       <label>
        <input
         type="radio"
         value="true"
         {...register('sanctions.internationalWires')}
        />
        Yes
       </label>
       <label>
        <input
         type="radio"
         value="false"
         {...register('sanctions.internationalWires')}
        />
        No
       </label>
      </div>
     </div>

     {internationalWires === true && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Frequency</label>
        <input
         type="text"
         {...register('sanctions.internationalWiresDetails.frequency', { required: 'Frequency is required' })}
        />
       </div>
       <div className="form-group">
        <label>Typical countries</label>
        <textarea
         placeholder="List countries separated by commas"
         {...register('sanctions.internationalWiresDetails.countries')}
        />
       </div>
       <div className="form-group">
        <label>Currency types involved</label>
        <textarea
         placeholder="List currencies separated by commas"
         {...register('sanctions.internationalWiresDetails.currencies')}
        />
       </div>
      </div>
     )}
    </div>

    {/* Section 5: Source of Funds */}
    <div className="form-section">
     <h3>Section 5: Source of Funds / Income Verification</h3>

     <div className="form-group">
      <label>What is the source of funds for the relationship?</label>
      <select {...register('sourceOfFunds.source', { required: 'Please select source of funds' })}>
       <option value="">Select Source</option>
       <option value="salary">Salary/Wages</option>
       <option value="investments">Investments</option>
       <option value="businessRevenues">Business Revenues</option>
       <option value="inheritance">Inheritance/Gift</option>
       <option value="saleOfAssets">Sale of Assets</option>
       <option value="other">Other</option>
      </select>
      {errors.sourceOfFunds?.source && <div className="error">{errors.sourceOfFunds.source.message}</div>}
     </div>

     {source === 'other' && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Specify other source</label>
        <input
         type="text"
         {...register('sourceOfFunds.otherSource', { required: 'Please specify other source' })}
        />
       </div>
      </div>
     )}

     {source === 'businessRevenues' && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Nature of products/services</label>
        <textarea
         {...register('sourceOfFunds.businessRevenuesDetails.natureOfBusiness', { required: 'Nature of business is required' })}
        />
       </div>
       <div className="form-group">
        <label>Primary clients or vendors (domestic/international)</label>
        <textarea
         {...register('sourceOfFunds.businessRevenuesDetails.primaryClients', { required: 'Primary clients information is required' })}
        />
       </div>
       <div className="form-group">
        <label>Any exposure to high-risk sectors? (e.g. crypto, casinos, arms, shell companies)</label>
        <div className="radio-group">
         <label>
          <input
           type="radio"
           value="true"
           {...register('sourceOfFunds.businessRevenuesDetails.highRiskSectors')}
          />
          Yes
         </label>
         <label>
          <input
           type="radio"
           value="false"
           {...register('sourceOfFunds.businessRevenuesDetails.highRiskSectors')}
          />
          No
         </label>
        </div>
       </div>
       {watch('sourceOfFunds.businessRevenuesDetails.highRiskSectors') === true && (
        <div className="conditional-section">
         <div className="form-group">
          <label>Describe high-risk sector exposure</label>
          <textarea
           {...register('sourceOfFunds.businessRevenuesDetails.highRiskSectorDetails', { required: 'High-risk sector details are required' })}
          />
         </div>
        </div>
       )}
      </div>
     )}
    </div>

    {/* Section 6: Ongoing Monitoring */}
    <div className="form-section">
     <h3>Section 6: Ongoing Monitoring Triggers</h3>

     <div className="form-group">
      <label>Will the business or account require third-party funding?</label>
      <div className="radio-group">
       <label>
        <input
         type="radio"
         value="true"
         {...register('ongoingMonitoring.thirdPartyFunding')}
        />
        Yes
       </label>
       <label>
        <input
         type="radio"
         value="false"
         {...register('ongoingMonitoring.thirdPartyFunding')}
        />
        No
       </label>
      </div>
     </div>

     {thirdPartyFunding === true && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Third party name</label>
        <input
         type="text"
         {...register('ongoingMonitoring.thirdPartyFundingDetails.thirdPartyName', { required: 'Third party name is required' })}
        />
       </div>
       <div className="form-group">
        <label>Relationship to third party</label>
        <input
         type="text"
         {...register('ongoingMonitoring.thirdPartyFundingDetails.relationship', { required: 'Relationship is required' })}
        />
       </div>
      </div>
     )}

     <div className="form-group">
      <label>Will the business or account require large cash activity (&gt; $10,000)?</label>
      <div className="radio-group">
       <label>
        <input
         type="radio"
         value="true"
         {...register('ongoingMonitoring.largeCashActivity')}
        />
        Yes
       </label>
       <label>
        <input
         type="radio"
         value="false"
         {...register('ongoingMonitoring.largeCashActivity')}
        />
        No
       </label>
      </div>
     </div>

     {largeCashActivity === true && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Frequency and expected cash thresholds</label>
        <textarea
         {...register('ongoingMonitoring.largeCashActivityDetails.frequency', { required: 'Frequency is required' })}
        />
       </div>
       <div className="form-group">
        <label>Expected cash thresholds</label>
        <textarea
         {...register('ongoingMonitoring.largeCashActivityDetails.thresholds', { required: 'Thresholds are required' })}
        />
       </div>
      </div>
     )}

     <div className="form-group">
      <label>Will the business or account have foreign beneficial owners or PEPs (Politically Exposed Persons)?</label>
      <div className="radio-group">
       <label>
        <input
         type="radio"
         value="true"
         {...register('ongoingMonitoring.foreignBeneficialOwnersOrPEPs')}
        />
        Yes
       </label>
       <label>
        <input
         type="radio"
         value="false"
         {...register('ongoingMonitoring.foreignBeneficialOwnersOrPEPs')}
        />
        No
       </label>
      </div>
     </div>

     {foreignBeneficialOwnersOrPEPs === true && (
      <div className="conditional-section">
       <div className="form-group">
        <label>Provide full details, including office held and country</label>
        <textarea
         {...register('ongoingMonitoring.foreignBeneficialOwnersOrPEPsDetails.details', { required: 'Details are required' })}
        />
       </div>
       <div className="form-group">
        <label>Office held</label>
        <input
         type="text"
         {...register('ongoingMonitoring.foreignBeneficialOwnersOrPEPsDetails.officeHeld', { required: 'Office held is required' })}
        />
       </div>
       <div className="form-group">
        <label>Country</label>
        <input
         type="text"
         {...register('ongoingMonitoring.foreignBeneficialOwnersOrPEPsDetails.country', { required: 'Country is required' })}
        />
       </div>
       <div className="form-group">
        <label>Exposure risk</label>
        <textarea
         {...register('ongoingMonitoring.foreignBeneficialOwnersOrPEPsDetails.exposureRisk', { required: 'Exposure risk is required' })}
        />
       </div>
      </div>
     )}
    </div>

    <div className="text-center mt-8">
     <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
      disabled={isSubmitting}
     >
      {isSubmitting ? 'Submitting...' : 'Submit KYC Form'}
     </button>
    </div>
   </form>
  </div>
 );
}

export default App; 