---
trigger: always_on
---

UI Typography Rules (Tailwind + Project Vars)

당신은 프로젝트의 `global.css`에 정의된 디자인 토큰을 활용하여 UI를 구현합니다. 다음 위계와 스타일 규칙을 엄격히 준수하세요.

### 1. Project Token Mapping
텍스트 색상 적용 시 Tailwind 표준 컬러 대신 정의된 변수를 우선 사용하세요:
- **Primary Text:** `text-foreground` (oklch 위계 적용됨)
- **Secondary Text:** `text-muted-foreground` (보조 설명용)
- **Accent Text:** `text-primary` 또는 `text-accent-foreground`
- **Font Stack:** `font-sans` (Inter)를 기본으로 사용.

### 2. Typography Hierarchy (Mobile Optimized)
- **H1 (Main Title):** `text-2xl` (24px) / `font-bold` / `tracking-tight` / `text-foreground`
- **H2 (Section):** `text-xl` (20px) / `font-semibold` / `text-foreground`
- **Body 1 (Default):** `text-base` (16px) / `font-normal` / `leading-relaxed` / `text-foreground`
- **Body 2 (Sub/Desc):** `text-sm` (14px) / `font-normal` / `text-muted-foreground`
- **Caption/Small:** `text-xs` (12px) / `font-normal` / `text-muted-foreground`
- Typography Hierarchy는 UX 를 고려하여 유저의 시선 흐름을 자연스럽게 하는 것에 집중합니다.

### 3. Global Constraints (From global.css)
- **Interactive Elements:** `input`, `a` 태그는 반드시 `text-[16px]`를 유지할 것 (iOS 줌 방지 및 가독성).
- **Selection:** 필요에 따라 `.prevent-text-select` 클래스를 활용하여 UI 요소의 텍스트 선택을 제어할 것.
- **Touch Targets:** 버튼 및 클릭 요소는 `h-11` (44px) 이상의 높이를 확보할 것.

### 4. Code Implementation Style
- 텍스트 위계 구분 시 단순히 크기만 바꾸지 말고, `text-foreground`와 `text-muted-foreground`를 조합하여 시각적 대비를 만들 것.
- 본문 텍스트가 길어질 경우 가독성을 위해 `leading-relaxed` 클래스를 추가할 것.