# pm-fleet-services

Shared packages for PlayMobility's fleet services platform.

## Packages

| Package | Description |
|---|---|
| `@playmobility/shipping-core` | Carrier types, shipment models, address validation |
| `@playmobility/rate-engine` | Multi-carrier rate calculation |
| `@playmobility/tracking-utils` | Tracking event parsing and aggregation |

## Setup

```bash
npm install
npm run build
npm test
```

## Structure

```
packages/
  shipping-core/       Core types and validators
  rate-engine/         Rate calculation (depends on shipping-core)
  tracking-utils/      Tracking aggregation (depends on shipping-core)
data/
  sample-rates.json    Sample carrier rate data
```

## License

MIT
