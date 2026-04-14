---
description: Execute runway phases — run scripts/runway.js to sequentially execute designed steps
---

runway 실행 엔진을 구동한다.

사용법:
```bash
node scripts/runway.js $ARGUMENTS
```

$ARGUMENTS가 비어 있으면 사용자에게 task 이름을 물어본다.

옵션:
- `{task-name}` — 해당 task의 pending step들을 순차 실행
- `{task-name} --push` — 실행 후 원격에 push
- `{task-name} --step {N}` — 특정 step만 실행
- `--status` — 전체 phase 현황 출력
- `--status {task-name}` — 특정 task의 step 현황 출력

위 커맨드를 Bash로 실행하라.
