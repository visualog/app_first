---
description: 메이저 버전을 올리고 마이너/패치를 초기화하며 태그를 생성합니다 (X.x.x -> X+1.0.0)
---

// turbo
1. 앱의 메이저 버전을 업데이트하고 Git 태그를 생성합니다.
```bash
node mobile/scripts/release.js major
```
2. 원격 저장소에 변경 사항과 태그를 푸시합니다.
```bash
git push origin main && git push origin --tags
```
