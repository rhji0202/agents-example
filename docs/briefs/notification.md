# Notification Brief

## Summary

주문 처리 각 단계에서 고객과 관리자에게 알림을 발송하고, 처리 지연 시 에스컬레이션을 수행한다.

## Flow

1. 도메인 이벤트 발생 → 알림 생성
2. 수신자/채널 결정 (이메일/SMS)
3. 알림 발송
4. 처리 지연 모니터링 → 체류 시간 초과 시 에스컬레이션
5. 에스컬레이션 4단계: 담당자(24h) → 팀장(48h) → 부서장(72h) → 운영관리자(96h)

## Business Rules

- 모든 상태 전이 시 고객에게 알림
- 처리 지연 시 사과 + 보상 안내
- 에스컬레이션 단계별 시간 기준:
  - 1단계 (24h): 담당자
  - 2단계 (48h): 팀장
  - 3단계 (72h): 부서장
  - 4단계 (96h): 운영 관리자
- 알림 채널: 이메일, SMS
- 완료 후 만족도 조사 요청

## Notification Events

| Event | Source Domain | Recipient | Channel |
|-------|-------------|-----------|---------|
| 주문 접수 | order | 고객 | 이메일, SMS |
| 신청서 승인 | order | 고객 | 이메일, SMS |
| 신청서 반려 | order | 고객 | 이메일, SMS |
| 상품 수령 완료 | inbound | 고객 | 이메일 |
| 측정/검수 완료 | inbound | 고객 | 이메일 |
| 금지품목 발견 | inbound | 고객, Admin | 이메일, SMS |
| 결제 요청 | payment | 고객 | 이메일, SMS |
| 결제 완료 | payment | 고객 | 이메일 |
| 결제 실패 | payment | 고객, CS | 이메일, SMS |
| 출고 완료 | shipment | 고객 | 이메일, SMS |
| 배송 현황 | shipment | 고객 | 이메일 |
| 배송 완료 | shipment | 고객, CS | 이메일, SMS |
| 배송 오류 | shipment | 고객, CS | 이메일, SMS |
| 리턴 승인 | return | 고객 | 이메일, SMS |
| 환불 완료 | return | 고객 | 이메일, SMS |
| 에스컬레이션 | all | 담당 관리자 | 이메일 |

## Status

```
created → sent → read
              ↘ failed → retrying → sent
```

## Screens

| Screen | Path | Key Features |
|--------|------|-------------|
| 알림 목록 (고객) | /mypage/notifications | 읽음/안읽음 필터, 날짜 정렬 |
| 알림 관리 | /admin/settings/notifications | 알림 템플릿, 채널 설정 |
| 에스컬레이션 대시보드 | /admin/escalations | 지연 건 목록, 단계별 필터, 긴급도 |

## Out of Scope

- 카카오 알림톡 — v2
- 푸시 알림 (모바일) — v2
- 알림 수신 설정 (고객별 on/off) — v2
