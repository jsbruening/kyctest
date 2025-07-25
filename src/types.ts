export interface KYCFormData {
  processInstanceId: string;
  formData: {
    // Section 1: Basic Customer Identification
    customerType: 'individual' | 'entity';
    individual?: {
      fullName: string;
      dateOfBirth: string;
      residentialAddress: string;
      nationality: string;
      usPerson: boolean;
      ssn?: string;
      alienRegistrationNumber?: string;
      passportDetails?: {
        number: string;
        issuingCountry: string;
        expirationDate: string;
      };
      idType: 'driverLicense' | 'passport' | 'other';
      driverLicense?: {
        number: string;
        issuingState: string;
        expirationDate: string;
      };
      otherId?: {
        type: string;
        issuingAuthority: string;
        number: string;
        expirationDate: string;
      };
    };
    entity?: {
      legalName: string;
      entityType: string;
      registrationNumber: string;
      businessAddress: string;
    };

    // Section 2: Beneficial Ownership
    beneficialOwnership: {
      hasOwners: boolean;
      owners?: Array<{
        name: string;
        dateOfBirth: string;
        address: string;
        ownershipPercentage: number;
        idType: 'driverLicense' | 'passport' | 'other';
        driverLicense?: {
          number: string;
          issuingState: string;
          expirationDate: string;
        };
        passport?: {
          number: string;
          issuingCountry: string;
          expirationDate: string;
        };
        otherId?: {
          type: string;
          issuingAuthority: string;
          number: string;
          expirationDate: string;
        };
      }>;
      controlPerson?: {
        name: string;
        title: string;
        dateOfBirth: string;
        address: string;
        idType: 'driverLicense' | 'passport' | 'other';
        driverLicense?: {
          number: string;
          issuingState: string;
          expirationDate: string;
        };
        passport?: {
          number: string;
          issuingCountry: string;
          expirationDate: string;
        };
        otherId?: {
          type: string;
          issuingAuthority: string;
          number: string;
          expirationDate: string;
        };
      };
    };

    // Section 3: Nature of Relationship
    relationship: {
      purpose: 'personalBanking' | 'businessOperating' | 'tradeFinance' | 'investments' | 'escrow' | 'other';
      businessDetails?: {
        industry: string;
        naicsCode: string;
        transactionTypes: string[];
        monthlyVolume: '<10k' | '10-50k' | '50-250k' | '250k+';
        internationalTransactions: boolean;
        countries?: string[];
      };
    };

    // Section 4: Sanctions & Geographic Risk
    sanctions: {
      sanctionedJurisdiction: boolean;
      sanctionedJurisdictionDetails?: {
        natureOfInteraction: string;
        counterparties: string[];
      };
      foreignBeneficialOwners: boolean;
      foreignBeneficialOwnersDetails?: {
        country: string;
        passportNumber: string;
        details: string;
      };
      internationalWires: boolean;
      internationalWiresDetails?: {
        frequency: string;
        countries: string[];
        currencies: string[];
      };
    };

    // Section 5: Source of Funds
    sourceOfFunds: {
      source: 'salary' | 'investments' | 'businessRevenues' | 'inheritance' | 'saleOfAssets' | 'other';
      otherSource?: string;
      businessRevenuesDetails?: {
        natureOfBusiness: string;
        primaryClients: string;
        primaryVendors: string;
        highRiskSectors: boolean;
        highRiskSectorDetails?: string;
      };
    };

    // Section 6: Ongoing Monitoring
    ongoingMonitoring: {
      thirdPartyFunding: boolean;
      thirdPartyFundingDetails?: {
        thirdPartyName: string;
        relationship: string;
      };
      largeCashActivity: boolean;
      largeCashActivityDetails?: {
        frequency: string;
        thresholds: string;
      };
      foreignBeneficialOwnersOrPEPs: boolean;
      foreignBeneficialOwnersOrPEPsDetails?: {
        details: string;
        officeHeld: string;
        country: string;
        exposureRisk: string;
      };
    };
  };
} 