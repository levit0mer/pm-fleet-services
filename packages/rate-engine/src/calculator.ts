import {
  ShipmentRequest,
  ShipmentRate,
  CarrierCode,
  ServiceLevel,
  PackageDimensions,
  Address,
} from '@playmobility/shipping-core';
import { haversineDistance, validateCoordinate } from '@playmobility/geo-utils';
import type { Coordinate } from '@playmobility/geo-utils';

interface ZoneRate {
  baseRate: number;
  perLbRate: number;
  fuelSurchargePercent: number;
  estimatedDays: number;
}

const ZONE_RATES: Record<CarrierCode, Partial<Record<ServiceLevel, ZoneRate>>> = {
  ups: {
    ground: { baseRate: 8.50, perLbRate: 0.45, fuelSurchargePercent: 7.5, estimatedDays: 5 },
    express: { baseRate: 15.75, perLbRate: 0.85, fuelSurchargePercent: 9.0, estimatedDays: 2 },
    overnight: { baseRate: 28.50, perLbRate: 1.50, fuelSurchargePercent: 11.0, estimatedDays: 1 },
  },
  fedex: {
    ground: { baseRate: 8.25, perLbRate: 0.42, fuelSurchargePercent: 7.0, estimatedDays: 5 },
    express: { baseRate: 16.00, perLbRate: 0.90, fuelSurchargePercent: 8.5, estimatedDays: 2 },
    overnight: { baseRate: 29.00, perLbRate: 1.55, fuelSurchargePercent: 10.5, estimatedDays: 1 },
    economy: { baseRate: 6.50, perLbRate: 0.35, fuelSurchargePercent: 6.0, estimatedDays: 7 },
  },
  usps: {
    ground: { baseRate: 5.00, perLbRate: 0.30, fuelSurchargePercent: 0, estimatedDays: 7 },
    express: { baseRate: 12.50, perLbRate: 0.65, fuelSurchargePercent: 0, estimatedDays: 3 },
  },
  dhl: {
    express: { baseRate: 18.00, perLbRate: 1.00, fuelSurchargePercent: 12.0, estimatedDays: 2 },
    overnight: { baseRate: 32.00, perLbRate: 1.75, fuelSurchargePercent: 14.0, estimatedDays: 1 },
    economy: { baseRate: 7.50, perLbRate: 0.40, fuelSurchargePercent: 8.0, estimatedDays: 8 },
  },
};

const DISTANCE_SURCHARGE_THRESHOLD_KM = 500;
const DISTANCE_SURCHARGE_RATE = 0.005; // $0.005 per km over threshold

/**
 * Calculate a distance-based surcharge for long-haul shipments.
 * Uses haversine distance between origin and destination coordinates.
 */
export function calculateDistanceSurcharge(
  originCoord: Coordinate,
  destCoord: Coordinate,
): number {
  if (!validateCoordinate(originCoord) || !validateCoordinate(destCoord)) {
    return 0;
  }
  const distKm = haversineDistance(originCoord, destCoord);
  if (distKm <= DISTANCE_SURCHARGE_THRESHOLD_KM) return 0;
  return Math.round((distKm - DISTANCE_SURCHARGE_THRESHOLD_KM) * DISTANCE_SURCHARGE_RATE * 100) / 100;
}

function calculateDimWeight(pkg: PackageDimensions): number {
  return (pkg.lengthIn * pkg.widthIn * pkg.heightIn) / 139;
}

function getBillableWeight(pkg: PackageDimensions): number {
  const dimWeight = calculateDimWeight(pkg);
  return Math.max(pkg.weightLbs, dimWeight);
}

export function calculatePackageRate(
  pkg: PackageDimensions,
  carrier: CarrierCode,
  serviceLevel: ServiceLevel,
): ShipmentRate | null {
  const zoneRate = ZONE_RATES[carrier]?.[serviceLevel];
  if (!zoneRate) return null;

  const billableWeight = getBillableWeight(pkg);
  const baseCost = zoneRate.baseRate + billableWeight * zoneRate.perLbRate;
  const surcharges = baseCost * (zoneRate.fuelSurchargePercent / 100);
  const totalCost = Math.round((baseCost + surcharges) * 100) / 100;

  return {
    carrier,
    serviceLevel,
    baseCost: Math.round(baseCost * 100) / 100,
    surcharges: Math.round(surcharges * 100) / 100,
    totalCost,
    estimatedDays: zoneRate.estimatedDays,
    currency: 'USD',
  };
}

export function calculateRate(request: ShipmentRequest): ShipmentRate[] {
  const carriers: CarrierCode[] = request.carrier
    ? [request.carrier]
    : ['ups', 'fedex', 'usps', 'dhl'];

  const results: ShipmentRate[] = [];

  for (const carrier of carriers) {
    const serviceLevels: ServiceLevel[] = request.serviceLevel
      ? [request.serviceLevel]
      : (Object.keys(ZONE_RATES[carrier] || {}) as ServiceLevel[]);

    for (const service of serviceLevels) {
      let totalBase = 0;
      let totalSurcharges = 0;
      let maxDays = 0;

      for (const pkg of request.packages) {
        const rate = calculatePackageRate(pkg, carrier, service);
        if (!rate) continue;
        totalBase += rate.baseCost;
        totalSurcharges += rate.surcharges;
        maxDays = Math.max(maxDays, rate.estimatedDays);
      }

      if (totalBase > 0) {
        results.push({
          carrier,
          serviceLevel: service,
          baseCost: Math.round(totalBase * 100) / 100,
          surcharges: Math.round(totalSurcharges * 100) / 100,
          totalCost: Math.round((totalBase + totalSurcharges) * 100) / 100,
          estimatedDays: maxDays,
          currency: 'USD',
        });
      }
    }
  }

  return results;
}

export function getBestRate(request: ShipmentRequest): ShipmentRate | null {
  const rates = calculateRate(request);
  if (rates.length === 0) return null;
  return rates.reduce((best, rate) =>
    rate.totalCost < best.totalCost ? rate : best,
  );
}

export function compareCarriers(
  request: ShipmentRequest,
): Map<CarrierCode, ShipmentRate[]> {
  const rates = calculateRate(request);
  const grouped = new Map<CarrierCode, ShipmentRate[]>();

  for (const rate of rates) {
    if (!grouped.has(rate.carrier)) {
      grouped.set(rate.carrier, []);
    }
    grouped.get(rate.carrier)!.push(rate);
  }

  return grouped;
}
