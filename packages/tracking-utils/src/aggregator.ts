import {
  TrackingInfo,
  CarrierCode,
  TrackingStatus,
} from '@playmobility/shipping-core';
import dayjs from 'dayjs';

export interface AggregateStats {
  total: number;
  byStatus: Record<TrackingStatus, number>;
  byCarrier: Record<CarrierCode, number>;
  avgTransitDays: number;
  onTimeRate: number;
}

export function aggregateTracking(
  shipments: TrackingInfo[],
  targetDays: number = 5,
): AggregateStats {
  const byStatus: Record<string, number> = {};
  const byCarrier: Record<string, number> = {};
  let totalTransitDays = 0;
  let deliveredCount = 0;
  let onTimeCount = 0;

  for (const shipment of shipments) {
    byStatus[shipment.currentStatus] =
      (byStatus[shipment.currentStatus] || 0) + 1;
    byCarrier[shipment.carrier] = (byCarrier[shipment.carrier] || 0) + 1;

    if (
      shipment.currentStatus === 'delivered' &&
      shipment.events.length >= 2
    ) {
      const pickupEvent = shipment.events.find(
        (e) => e.status === 'picked_up',
      );
      const deliveryEvent = shipment.events.find(
        (e) => e.status === 'delivered',
      );

      if (pickupEvent && deliveryEvent) {
        const transitDays = dayjs(deliveryEvent.timestamp).diff(
          dayjs(pickupEvent.timestamp),
          'day',
        );
        totalTransitDays += transitDays;
        deliveredCount++;
        if (transitDays <= targetDays) {
          onTimeCount++;
        }
      }
    }
  }

  return {
    total: shipments.length,
    byStatus: byStatus as Record<TrackingStatus, number>,
    byCarrier: byCarrier as Record<CarrierCode, number>,
    avgTransitDays:
      deliveredCount > 0
        ? Math.round((totalTransitDays / deliveredCount) * 10) / 10
        : 0,
    onTimeRate:
      deliveredCount > 0
        ? Math.round((onTimeCount / deliveredCount) * 100) / 100
        : 0,
  };
}

export function getDeliveryEstimate(
  transitHistory: TrackingInfo[],
): number | null {
  const deliveredShipments = transitHistory.filter(
    (s) => s.currentStatus === 'delivered',
  );
  if (deliveredShipments.length < 3) return null;

  let totalDays = 0;
  let count = 0;

  for (const shipment of deliveredShipments) {
    const pickup = shipment.events.find((e) => e.status === 'picked_up');
    const delivery = shipment.events.find((e) => e.status === 'delivered');

    if (pickup && delivery) {
      totalDays += dayjs(delivery.timestamp).diff(
        dayjs(pickup.timestamp),
        'day',
      );
      count++;
    }
  }

  return count > 0 ? Math.ceil(totalDays / count) : null;
}
