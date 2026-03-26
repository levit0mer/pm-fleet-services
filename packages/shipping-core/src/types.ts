export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PackageDimensions {
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  weightLbs: number;
}

export type CarrierCode = 'ups' | 'fedex' | 'usps' | 'dhl';
export type ServiceLevel = 'ground' | 'express' | 'overnight' | 'economy';

export interface ShipmentRequest {
  origin: Address;
  destination: Address;
  packages: PackageDimensions[];
  carrier?: CarrierCode;
  serviceLevel?: ServiceLevel;
  declaredValue?: number;
  requireSignature?: boolean;
}

export interface ShipmentRate {
  carrier: CarrierCode;
  serviceLevel: ServiceLevel;
  baseCost: number;
  surcharges: number;
  totalCost: number;
  estimatedDays: number;
  currency: string;
}

export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: TrackingStatus;
  description: string;
}

export type TrackingStatus =
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'returned';

export interface TrackingInfo {
  trackingNumber: string;
  carrier: CarrierCode;
  events: TrackingEvent[];
  estimatedDelivery?: string;
  currentStatus: TrackingStatus;
}
