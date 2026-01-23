---
trigger: always_on
---

1. Don't modify the code unless I said so.
2. 하드코딩 금지 (Standardize): 모든 수치(색상, 간격, 크기)는 정해진 디자인 토큰만 사용한다.
3. 부품화 (Componentize): UI는 잘게 쪼개어 공통 컴포넌트로 만들고, 어디서든 조립할 수 있게 설계한다.
4. 로직 분리 (Decouple): 화면(UI)과 기능(Logic)을 섞지 않는다. 데이터 처리는 전용 Hooks/Service에서만 수행한다.
5. 중복 제거 (DRY): 같은 코드를 두 번 쓰지 않는다. 반복되는 로직은 무조건 공통 함수로 추출한다.
6. 타입 명시 (Define): 데이터의 형태를 미리 정의하고 사용한다. 무엇이 오고 가는지 코드로 명확히 밝힌다.
7. 모든 UI/UX 는 모바일 사용자를 우선으로 개발해.
8. 모든 작업이 끝나면 작업 내용과 함께 git add & git commit 을 진행해.
9. TDD (Testing): 테스트 코드를 먼저, 혹은 함께 작성하여 기능의 안정성을 보장한다.
