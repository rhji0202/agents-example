# Data Model Overview

## Entity Relationships

```
User 1──N Order              (order.user_id → user.id)
User 1──1 BusinessProfile    (business_profile.user_id → user.id, 사업자만)
User 1──N BusinessDocument   (business_document.user_id → user.id)
User 1──1 CustomerContract   (customer_contract.user_id → user.id, 사업자만)
User 1──N PointTransaction   (point_transaction.user_id → user.id)
User 1──N StaffPermission    (staff_permission.user_id → user.id, 직원만)
StaffPermission N──1 PermissionGroup (staff_permission.permission_group_id → permission_group.id)
CustomerContract N──1 User   (customer_contract.dedicated_staff_id → user.id)
User 1──1 Deposit            (deposit.user_id → user.id)

Order 1──N OrderItem         (order_item.order_id → order.id)
Order 1──N InboundItem       (inbound_item.order_id → order.id)
Order 1──N PaymentRequest    (payment_request.order_id → order.id)
Order 1──1 Shipment          (shipment.order_id → order.id)
Order 1──N ReturnRequest     (return_request.order_id → order.id)
Order 1──1 Review            (review.order_id → order.id)

OrderItem 1──1 InboundItem   (inbound_item.order_item_id → order_item.id)
InboundItem 1──N InboundPhoto (inbound_photo.inbound_item_id → inbound_item.id)

Deposit 1──N DepositTransaction (deposit_transaction.deposit_id → deposit.id)

Shipment 1──N ShipmentError  (shipment_error.shipment_id → shipment.id)

ReturnRequest 1──N ReturnEvidence (return_evidence.return_request_id → return_request.id)

User 1──N Notification       (notification.user_id → user.id)
User 1──N Escalation         (escalation.assignee_id → user.id)
```

## Domain Model Index

| Domain | Entities | Primary Entity |
|--------|---------|---------------|
| auth | User, BusinessProfile, BusinessDocument, CustomerContract, PointTransaction, PermissionGroup, StaffPermission | User |
| order | Order, OrderItem | Order |
| inbound | InboundItem, InboundPhoto | InboundItem |
| payment | PaymentRequest, Deposit, DepositTransaction, PricingRule | PaymentRequest |
| shipment | Shipment, ShipmentError, Review | Shipment |
| return | ReturnRequest, ReturnEvidence | ReturnRequest |
| notification | Notification, Escalation | Notification |

## Details

- [auth](user.md)
- [order](order.md)
- [inbound](inbound.md)
- [payment](payment.md)
- [shipment](shipment.md)
- [return](return.md)
- [notification](notification.md)
