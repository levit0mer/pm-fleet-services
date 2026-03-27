# pm-fleet-services

Stripped-down version of our internal fleet services monorepo, put together to reproduce a `jfrog-cli` build-info issue with npm workspaces.

## Packages

| Package | Description |
|---|---|
| `@playmobility/shipping-core` | Carrier types, shipment models, address validation |
| `@playmobility/rate-engine` | Multi-carrier rate calculation |
| `@playmobility/tracking-utils` | Tracking event parsing and aggregation |

## Reproduce

```bash
git clone https://github.com/levit0mer/pm-fleet-services.git
cd pm-fleet-services
npm install
npm run build && npm test
jf npm install --build-name=test-build --build-number=1
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
