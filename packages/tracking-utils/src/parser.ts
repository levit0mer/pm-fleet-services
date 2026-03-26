import {
  TrackingEvent,
  TrackingInfo,
  TrackingStatus,
  CarrierCode,
} from '@playmobility/shipping-core';
import { validateCoordinate } from '@playmobility/geo-utils';
import type { Coordinate } from '@playmobility/geo-utils';
import dayjs from 'dayjs';

interface RawTrackingEvent {
  date: string;
  time?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  status_code: string;
  message: string;
}

const STATUS_CODE_MAP: Record<string, TrackingStatus> = {
  PU: 'picked_up',
  IT: 'in_transit',
  OD: 'out_for_delivery',
  DL: 'delivered',
  EX: 'exception',
  RT: 'returned',
};

/**
 * Validate and extract coordinates from a raw tracking event.
 * Returns null if coordinates are missing or invalid.
 */
export function extractEventCoordinates(
  raw: RawTrackingEvent,
): Coordinate | null {
  if (!raw.coordinates) return null;
  const coord = { lat: raw.coordinates.lat, lng: raw.coordinates.lng };
  return validateCoordinate(coord) ? coord : null;
}

export function parseTrackingEvent(raw: RawTrackingEvent): TrackingEvent {
  const timestamp = raw.time
    ? dayjs(`${raw.date} ${raw.time}`).toISOString()
    : dayjs(raw.date).toISOString();

  const status = STATUS_CODE_MAP[raw.status_code] || 'in_transit';
  const validCoords = extractEventCoordinates(raw);

  return {
    timestamp,
    location: raw.location || 'Unknown',
    status,
    description: validCoords
      ? `${raw.message} [${validCoords.lat.toFixed(4)}, ${validCoords.lng.toFixed(4)}]`
      : raw.message,
  };
}

export function parseTrackingResponse(
  trackingNumber: string,
  carrier: CarrierCode,
  rawEvents: RawTrackingEvent[],
): TrackingInfo {
  const events = rawEvents
    .map(parseTrackingEvent)
    .sort((a, b) => dayjs(b.timestamp).unix() - dayjs(a.timestamp).unix());

  const currentStatus = events.length > 0 ? events[0].status : 'in_transit';

  const deliveredEvent = events.find((e) => e.status === 'delivered');
  const estimatedDelivery = deliveredEvent?.timestamp;

  return {
    trackingNumber,
    carrier,
    events,
    estimatedDelivery,
    currentStatus,
  };
}
