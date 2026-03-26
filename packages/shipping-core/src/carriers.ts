import { CarrierCode, ServiceLevel } from './types';

export const CARRIER_NAMES: Record<CarrierCode, string> = {
  ups: 'United Parcel Service',
  fedex: 'FedEx',
  usps: 'United States Postal Service',
  dhl: 'DHL Express',
};

export const SERVICE_LEVEL_NAMES: Record<ServiceLevel, string> = {
  ground: 'Ground',
  express: 'Express',
  overnight: 'Overnight',
  economy: 'Economy',
};

export const CARRIER_SERVICE_LEVELS: Record<CarrierCode, ServiceLevel[]> = {
  ups: ['ground', 'express', 'overnight'],
  fedex: ['ground', 'express', 'overnight', 'economy'],
  usps: ['ground', 'express'],
  dhl: ['express', 'overnight', 'economy'],
};

export const MAX_WEIGHT_LBS: Record<CarrierCode, number> = {
  ups: 150,
  fedex: 150,
  usps: 70,
  dhl: 150,
};

export const MAX_DIMENSION_IN = 108;

export function getAvailableServices(carrier: CarrierCode): ServiceLevel[] {
  return CARRIER_SERVICE_LEVELS[carrier] || [];
}

export function isServiceAvailable(
  carrier: CarrierCode,
  service: ServiceLevel,
): boolean {
  return CARRIER_SERVICE_LEVELS[carrier]?.includes(service) ?? false;
}
