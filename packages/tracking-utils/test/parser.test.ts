import { parseTrackingEvent, parseTrackingResponse } from '../src/parser';

describe('parseTrackingEvent', () => {
  it('should parse a standard tracking event', () => {
    const event = parseTrackingEvent({
      date: '2026-03-10',
      time: '14:30',
      location: 'Austin, TX',
      status_code: 'PU',
      message: 'Package picked up',
    });
    expect(event.status).toBe('picked_up');
    expect(event.location).toBe('Austin, TX');
    expect(event.description).toBe('Package picked up');
    expect(event.timestamp).toContain('2026-03-10');
  });

  it('should handle missing time', () => {
    const event = parseTrackingEvent({
      date: '2026-03-10',
      location: 'Denver, CO',
      status_code: 'IT',
      message: 'In transit',
    });
    expect(event.status).toBe('in_transit');
  });

  it('should default unknown status codes to in_transit', () => {
    const event = parseTrackingEvent({
      date: '2026-03-10',
      status_code: 'UNKNOWN',
      message: 'Processing',
    });
    expect(event.status).toBe('in_transit');
  });

  it('should handle missing location', () => {
    const event = parseTrackingEvent({
      date: '2026-03-10',
      status_code: 'IT',
      message: 'In transit',
    });
    expect(event.location).toBe('Unknown');
  });
});

describe('parseTrackingResponse', () => {
  it('should parse a full tracking response', () => {
    const info = parseTrackingResponse('1Z999AA10123456784', 'ups', [
      { date: '2026-03-10', time: '08:00', location: 'Austin, TX', status_code: 'PU', message: 'Picked up' },
      { date: '2026-03-11', time: '12:00', location: 'Dallas, TX', status_code: 'IT', message: 'In transit' },
      { date: '2026-03-12', time: '16:00', location: 'Denver, CO', status_code: 'DL', message: 'Delivered' },
    ]);
    expect(info.trackingNumber).toBe('1Z999AA10123456784');
    expect(info.carrier).toBe('ups');
    expect(info.events).toHaveLength(3);
    expect(info.currentStatus).toBe('delivered');
  });

  it('should sort events by timestamp descending', () => {
    const info = parseTrackingResponse('TEST123', 'fedex', [
      { date: '2026-03-12', status_code: 'DL', message: 'Delivered' },
      { date: '2026-03-10', status_code: 'PU', message: 'Picked up' },
      { date: '2026-03-11', status_code: 'IT', message: 'In transit' },
    ]);
    expect(info.events[0].status).toBe('delivered');
    expect(info.events[2].status).toBe('picked_up');
  });
});
