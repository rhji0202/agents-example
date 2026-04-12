# Data Model Overview

## Entity Relationships
```
User 1──N Inbound
User 1──N Consolidation
Inbound N──1 Consolidation
Consolidation 1──1 Payment
Consolidation 1──1 Shipment
Shipment 1──N TrackingEvent
```

## Domain Model Index
| Domain | Entities | Primary Entity |
|--------|---------|---------------|
| auth | User | User |
| inbound | Inbound | Inbound |
| consolidation | Consolidation | Consolidation |
| shipping | Shipment, TrackingEvent | Shipment |
| payment | Payment | Payment |

## Details
- [User (auth)](user.md)
- [Inbound](inbound.md)
- [Consolidation](consolidation.md)
- [Shipment + TrackingEvent](shipment.md)
- [Payment](payment.md)
