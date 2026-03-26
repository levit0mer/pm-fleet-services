import { Address, PackageDimensions, ShipmentRequest, CarrierCode } from './types';
import { MAX_WEIGHT_LBS, MAX_DIMENSION_IN, CARRIER_SERVICE_LEVELS } from './carriers';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const US_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR', 'VI', 'GU', 'AS', 'MP',
];

const ZIP_CODE_REGEX = /^\d{5}(-\d{4})?$/;

export function validateAddress(address: Address): ValidationResult {
  const errors: string[] = [];

  if (!address.street || address.street.trim().length === 0) {
    errors.push('Street address is required');
  }

  if (!address.city || address.city.trim().length === 0) {
    errors.push('City is required');
  }

  if (address.country === 'US') {
    if (!US_STATE_CODES.includes(address.state)) {
      errors.push(`Invalid US state code: ${address.state}`);
    }
    if (!ZIP_CODE_REGEX.test(address.zipCode)) {
      errors.push(`Invalid US ZIP code format: ${address.zipCode}`);
    }
  }

  if (!address.country || address.country.trim().length === 0) {
    errors.push('Country is required');
  }

  return { valid: errors.length === 0, errors };
}

export function validateDimensions(pkg: PackageDimensions): ValidationResult {
  const errors: string[] = [];

  if (pkg.lengthIn <= 0 || pkg.widthIn <= 0 || pkg.heightIn <= 0) {
    errors.push('All dimensions must be positive numbers');
  }

  const maxDim = Math.max(pkg.lengthIn, pkg.widthIn, pkg.heightIn);
  if (maxDim > MAX_DIMENSION_IN) {
    errors.push(`Maximum dimension exceeded: ${maxDim}in > ${MAX_DIMENSION_IN}in`);
  }

  const girth = 2 * (pkg.widthIn + pkg.heightIn) + pkg.lengthIn;
  if (girth > 165) {
    errors.push(`Package girth exceeds maximum: ${girth}in > 165in`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateWeight(
  weightLbs: number,
  carrier?: CarrierCode,
): ValidationResult {
  const errors: string[] = [];

  if (weightLbs <= 0) {
    errors.push('Weight must be a positive number');
  }

  if (carrier) {
    const maxWeight = MAX_WEIGHT_LBS[carrier];
    if (weightLbs > maxWeight) {
      errors.push(
        `Weight exceeds ${carrier.toUpperCase()} maximum: ${weightLbs}lbs > ${maxWeight}lbs`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateShipmentRequest(
  request: ShipmentRequest,
): ValidationResult {
  const errors: string[] = [];

  const originResult = validateAddress(request.origin);
  if (!originResult.valid) {
    errors.push(...originResult.errors.map((e) => `Origin: ${e}`));
  }

  const destResult = validateAddress(request.destination);
  if (!destResult.valid) {
    errors.push(...destResult.errors.map((e) => `Destination: ${e}`));
  }

  if (request.packages.length === 0) {
    errors.push('At least one package is required');
  }

  for (let i = 0; i < request.packages.length; i++) {
    const pkg = request.packages[i];
    const dimResult = validateDimensions(pkg);
    if (!dimResult.valid) {
      errors.push(...dimResult.errors.map((e) => `Package ${i + 1}: ${e}`));
    }
    const weightResult = validateWeight(pkg.weightLbs, request.carrier);
    if (!weightResult.valid) {
      errors.push(...weightResult.errors.map((e) => `Package ${i + 1}: ${e}`));
    }
  }

  if (request.carrier && request.serviceLevel) {
    const available = CARRIER_SERVICE_LEVELS[request.carrier];
    if (available && !available.includes(request.serviceLevel)) {
      errors.push(
        `${request.carrier.toUpperCase()} does not offer ${request.serviceLevel} service`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
