---
description: 프로젝트 전역 아키텍처 및 도메인 간 일관성을 심층 검수합니다.
---

이 워크플로우는 프로젝트의 아키텍처 원칙과 도메인(Serving, Worship, Notice 등) 간의 일관성이 유지되고 있는지 검수하기 위해 사용됩니다.

# 프로젝트 심층 검수 항목

### 1. 계층형 아키텍처 (Layered Architecture)
- **View-Hook-Service 패턴**: 컴포넌트(UI), 커스텀 훅(Logic), 서비스(API/Domain)가 명확히 분리되어 있는가?
- **로직 고립**: 복잡한 상태 관리나 데이터 가공 로직이 컴포넌트 내부에 직접 구현되지 않고 전용 훅으로 추출되었는가?

### 2. 디렉토리 및 라우팅 구조
- **Route Groups**: Next.js App Router의 Route Groups(`(domain)`)를 활용하여 관심사가 분리되었는가?
- **Atomic-style Assembly**: 컴포넌트가 `ui/`(기본), `common/`(복합 레이아웃), `elements/design/`(도메인 특화)으로 적절히 배치되었는가?

### 3. 컴포넌트 조립 일관성 (Composite Consistency)
- **입력 폼**: 모든 주요 도메인의 입력창이 `FullScreenForm` 레이아웃 컴포넌트를 사용하여 조립되었는가?
- **보드 카드**: 리스트 아이템들이 `BoardCard` 공통 프레임을 사용하여 시각적/동작적(Expand/Collapse) 일관성을 유지하는가?
- **공통 부품**: `ServiceDateSelector`, `LinkedResourceCard` 등 이미 검증된 공통 부품을 재사용하고 있는가?

### 4. 공통 훅(Hook) 관리 전략
- **분류**: 훅이 성격에 따라 `common/hooks`(도메인 공통), `util/hook`(유틸리티), 또는 도메인 내부 `hooks/`에 위치하는가?
- **재사용성**: 비슷한 로직(예: 중복 체크, 필터링)이 여러 곳에서 중복 구현되지 않고 공통 훅으로 관리되는가?

### 5. 디자인 시스템 및 모바일 우선 (Mobile-First)
- **디자인 토큰**: `globals.css`에 정의된 OKLCH 컬러 변수와 간격 토큰을 엄격히 준수하며 하드코딩이 없는가?
- **모바일 최적화**: 
  - `input`, `a` 태그에 `text-[16px]`가 적용되어 iOS 줌 현상을 방지하는가?
  - 클릭 가능한 요소의 높이가 `h-11`(44px) 이상으로 충분한가?
  - 뷰포트 높이 가변성(`useViewportHeight`)이 고려되었는가?

---
# 검수 방법
1. 현재 작업 중인 파일 외에도 관련 도메인의 코드를 함께 조회하여 일관성을 비교한다.
2. `find` 명령어를 통해 공통 레이아웃 컴포넌트(`FullScreenForm`, `BoardCard`)의 사용 빈도와 위치를 확인한다.
3. 발견된 비일관성이나 아키텍처 위반 사항을 리스트업하고 개선 방향을 제시한다.
