# Delivery Matcher — UI/UX Critique Report

> Generated with `impeccable` skill. Target: `mooneye/` (static HTML/CSS/JS, no build step).
> Screenshots reviewed: Setup input screen (6-zone mode, 9 members) and Results screen.

---

## 1. Heuristic Scoring

| # | Heuristic | Score (1–5) | Notes |
|---|-----------|:-----------:|-------|
| 1 | Visibility of system status | 4 | Matching animation (radar + shuffle cards, 3 sec) is clear; toast confirms copy/retry. |
| 2 | Match between system & real world | 3 | 「벽산5단지」등 실제 주소 기반 매칭은 현실적이나, 고정 PII가 소스에 하드코딩되어 있어 '시스템'과 '실제' 경계가 모호하다. |
| 3 | User control & freedom | 3 | Retry·Copy는 있으나, 결과 수정/재매칭 시 원본 데이터 손실 위험(단일 파일). |
| 4 | Consistency | 4 | Glassmorphism 테마, CSS 변수 체계, Outfit/Noto Sans KR 폰트 일관됨. |
| 5 | Error prevention | 2 | 매칭 시 zone당 최소 인원 검증 없음; 0인 zone을 허용하면 결과 화면 깨짐. |
| 6 | Recognition > recall | 4 | Map marker 번호, zone 입력 필드 번호, senior card 번호는 일관된 1:1 매핑. |
| 7 | Flexibility & efficiency of use | 3 | Tab으로 zone 수 전환(4/6/8/10)은 좋으나, zone 이름은 동적 편집 불가 — 고정 코드. |
| 8 | Aesthetic & minimalist design | 5 | 다크 glassmorphism 테마, accent gradient, glow sphere background — 일관된 몰입감. |
| 9 | Help users recognize/diagnose errors | 2 | 잘못된 입력(중복 이름, 0인 zone, member 수 vs zone 수 불일치) 시 명확한 피드백 없음. |
|10 | Help & documentation | 2 | Placeholder 텍스트 외 설명/도움말 없음. '벽산5단지' 고정 zone의 의미를 알 수 없음. |

**평균: 3.4 / 5**

---

## 2. Design Specificity Verdict: 8.5 / 10

구체적으로 구현된 디테일이 풍부하고 일관된 테마 시스템이 잘 구축되어 있음:

- **CSS 변수 체계**: `--accent`, `--accent-cyan`, `--bg-primary` 등 25+ 변수로 디자인 토큰화
- **Glassmorphism 정교함**: `backdrop-filter: blur(20px)` + `rgba` overlay + inset glow
- **애니메이션**: radar 2s, cardShuffle 1.2s, toast `cubic-bezier(0.175, 0.885, 0.32, 1.275)` — bounce effect 포함
- **Responsive**: 900px(1열), 768px(padding 조정), 460px(결과 버튼 세로 배치)
- **Font pair**: Noto Sans KR(본문) + Outfit(디스플레이/숫자) — 한국 앱에 적합한 조합

**약점**: 변수가 25개 이상으로, 일부는 중복(예: `--text-main` vs `--text-dim` vs `--text-muted`의 대비 부족).

---

## 3. Overall Impression

> "실제 재택 노인 배달 업무의 맥락을 이해한, 매우 완성도 높은 단일 페이지 도구."
> 
> 다크 Glassmorphism 테마가 일관되게 적용되었고, map + zone + senior 3단계 시각 계층이 명확함. 매칭 애니메이션이 '무작위'라는 느낌을 게임적으로 전달. 다만, **보안/개인정보 보호** 관점에서 PII 하드코딩은 심각한 design flaw이며, **에러 프리컨션**이 부족해 6-zone/9-member 같은 small-case에서도 실패할 여지가 있음.

---

## 4. Strengths

### ✅ 시각적 일관성 (A+)
- purple(accent) ↔ cyan(accent-cyan) ↔ green(success) ↔ amber(note) — 색상 부호화 일관
- map marker `#5428b6`(진한 보라) + white border + display font = zone 번호가 돋보임
- senior card 내부: 이름(하얀 굵게) → 전화번호(cyan) → 주소(회색) → 메모(amber box) — 시각적 위계 명확

### ✅ 매칭 애니메이션 (A)
- radar 90px circle + dashed outer ring(8s) + inner scan-line(2s) + dot(10px) — 정교한 '처리 중' 상태
- 3장의 shuffle card: `cardShuffle1/2/3` 각각 33%↔66% ↔ translate/scale/rotate 조합이 다르므로, '섞이는' 느낌이 자연스러움

### ✅ Responsive grid (A)
- `.config-grid: 1.2fr 0.8fr` — 왼쪽 넓게 입력, 오른쪽 map
- `.results-content-grid: 1.4fr 1fr` — map 넓게, senior list 좁게
- `.seniors-list: repeat(auto-fit, minmax(min(100%, 248px), 1fr))` — column-gap 20px, wrapping auto

### ✅ Copy-to-clipboard UX (A)
- 결과를 clipboard에 복사 후 toast "결과가 복사되었습니다!" — 재배달 시 카카오톡/문자로 붙여넣기 가능

---

## 5. Priority Issues

### 🔴 P0 (Critical) — PII 하드코딩 & 보안

```js
// app.js ~line 200
const seniorData = {
  "김영희": { phone: "010-1234-5678", address: "벽산5단지 304동 1201호", note: "문번호 3847" },
  ...
}
```

**문제**: 민감한 개인정보(이름, 전화번호, 상세 주소, 문열쇠 번호)가 **git 저장소에 하드코딩**되어 있음.
- 코드 열람자로 전원이 접근 가능
- 브랜치 머지/PR 리뷰 시 노출
- `.gitignore`로 `.js`는 막을 수 있으나, 최종 빌드 산출물(html)에도 포함됨

**제안**:
- (A) senior data를 JSON 파일로 분리하고 `.gitignore`에 추가
- (B) 웹페이지 로딩 시 `fetch('seniors.json')`로 외부 로드(로컬에서 테스트하려면 CORS 우회 필요)
- (C) 최소한: 화면에서 phone/문번호를 `****`로 마스킹하고, '보이기' 버튼 토글

---

### 🔴 P0 (Critical) — 에러 프리컨션 없음

**시나리오 1**: 6-zone 모드에서 member 수를 8로 설정 → zone당 1.33명 = 한 zone에 2명, 다른 zone에 0명. 0인 zone 매칭 시 results panel에서 "No members assigned"가 없어 **화면이 텅 비어 보임**.

**시나리오 2**: zone input에 빈 문자열 입력 → `mapZoneData[zoneName]`가 `undefined` → `map-image-wrapper`에서 `img` 없이 빈 영역.

**시나리오 3**: 중복 이름 입력 → Fisher-Yates shuffle 후 `Map`이 중복을 제거하지만, 사용자는 "왜 8명으로 했는데 7명만 매칭됐지?"라고 혼란스러워함.

**제안**:
- 매칭 버튼 클릭 시: member 수 ≥ zone 수 검사, 0인 zone 검사, 중복 이름 경고
- 실패 시: `.toast.show("⚠️ zone당 최소 1인이어야 합니다")`

---

### 🟡 P1 (High) — Zone 이름이 코드 고정

`zoneNames: ["벽산1단지","벽산2단지","벽산3단지","벽산4단지","벽산5단지","벽산6단지"]`

6-zone 모드에서 5단지/6단지가 **hardcoded**. 8-zone 모드(코드상 없음)를 추가하려면 `app.js` 수정 필요.

**제안**:
- `zone-names.json` 파일로 분리 + UI에서 zone 이름 편집 기능(단일 zone input이 아닌, zone name + slot 수의 테이블)
- 또는 `data-zone-label` 속성으로 CSS에서 읽게 함

---

### 🟡 P1 (High) — Senior card 정보 과밀

9-member × 6-zone = 15개 senior card. 각 카드는 이름 + phone + address + note(문번호).
- phone: `010-XXXX-XXXX` (12자)
- address: `벽산5단지 304동 1201호` (15자 이상)
- note: `문번호: 3847` (8자)
- 총 ~35자/카드, width 248px에 squeeze

**제안**:
- phone/문번호를 `tap to copy`로 숨기거나, `phone`은 기본 보이지만 `문번호`는 `...보기` 토글
- address를 `벽산5단지 → 304동 1201호`로 2라인

---

### 🟢 P2 (Medium) — Font pair의 한국 가독성

Outfit는 한글이 **없음**(한글이 표시되면 Noto Sans KR로 fallback).
- 결과 화면의 `font-family: var(--font-family-display)` applied on `senior-zone-title h4` → zone 이름(한국어)이 Outfit에서 Noto Sans KR로 '뚝' 바뀌는 visual glitch 가능.

**제안**: `font-family: 'Outfit', 'Noto Sans KR', sans-serif`로 역전.

---

## 6. Persona Red Flags

| Persona | Red Flag |
|---------|----------|
| **배달 담당자(50~70대)** | phone number이 `010-1234-5678` 형식 → 한국 50+세대는 `010 1234 5678`(space)를 더 선호. font-display의 Outfit(기하학적) + phone의 `#06b6d4` cyan이 숫자 가독성 저하. |
| **관리자(30~40대)** | "벽산5단지" zone에 **2인 고정** → 왜 2인가? 코드 주석에 이유 없으면 "이게 맞는가?" 불안. |
| **IT 담당자** | single HTML file, no build step, no CSP, no HTTPS. "이걸 웹호스팅에 올리면 PII 노출된다." |
| **노인 본인(간접)** | map에 이름/phone/문번호가 노출 → "내 정보가 다른 사람의 화면에 보일까?" |

---

## 7. Minor Observations

| # | Observation | Priority |
|---|-------------|----------|
| 1 | `.panel::before`에 3px accent-cyan gradient top-bar — 시각적 좋은 디테일 | ✨ |
| 2 | `map-image-wrapper img:hover { transform: scale(1.04) }` — 678/1024 aspect-ratio → wide image? | 🔍 |
| 3 | `toast`의 `z-index: 999` — modal이 있으면 아래로 빠짐 | ⚠️ |
| 4 | `cardShuffle`에서 33% → `z-index: 0`, 66% → `z-index: 2`. `z-index: 1`은 default. 3장 중 1장이 `z-index: 0`(뒤로 숨어 있음) — 시각적 shuffle 효과는 좋으나, `box-shadow`가 `z-index: 0`일 때 가려질 수 있음 | 🔍 |
| 5 | `btn-glow::after`의 `radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)` — click 시 flash effect. 좋은 UX. | ✨ |
| 6 | `.btn-secondary:hover { transform: translateY(-1px) }` — but `.btn-primary:hover { transform: translateY(-2px) }` — height mismatch on hover (1px vs 2px). 2px가 더 '압도감' 있으나, secondary가 낮아지면 레이아웃 흔들림. | 🐛 |
| 7 | CSS `@media (max-width: 768px)`에서 `.logo-area h1 { font-size: clamp(1rem, 5vw, 1.8rem) }` — `1rem`이 너무 작음 (16px). 2.2rem → 1rem = 55% reduction. | 🐛 |
| 8 | `result-panel`의 `.stats-summary-results` — 3-column grid but only 3 cards? (total zone, total members, avg). 3-column = equal width. 작은 device에서 3개 나란히 너무 좁을 수 있음. | 🔍 |
| 9 | `btn-glow:active::after { transition: 0s }` — `transition: 0s`보다 `transition: 0.05s`가 부드러운 | ✨ |
|10 | `textarea#memberInput`의 height 140px — 9-member 입력하면 6~7줄. `min-height`+`resize`로 유연하면 좋으나, 현재는 고정. | 🔍 |

---

## 8. Closing Questions

### Q1 — 데이터의 지속성
> 결과 매칭 시, senior data를 다시 편집하거나 zone을 바꾼 후 **재매칭**하면 원본 senior 정보가 사라지나요?
>
> **Option A**: `localStorage`에 last-match 저장 (저장·취소 가능)
> **Option B**: senior data를 separate JSON + fetch (git 관리 가능)
> **Option C**: 페이지 리프레시마다 재입력 강제 (최소 노출 원칙)

### Q2 — phone number 표시 형식
> 한국 50대 이상의 가독성을 위해 `010-XXXX-XXXX`를 `010 XXXX XXXX`(space)로 변경할까요?
>
> **Option A**: space로 변경
> **Option B**: tap 시 `tel:` href로 전화 연결
> **Option C**: 현재 유지 (hyphen이 더 '번호' 느낌)

### Q3 — 문번호 노출
> senior card에 `문번호: 3847`을 기본 노출할까요?
>
> **Option A**: 노출 (현재) — 빠른 확인
> **Option B**: `문번호 숨기기` 토글 — privacy 우선
> **Option C**: `문번호`를 phone 옆에 작은 `🔒` 아이콘과 함께 tap-for-reveal

### Q4 — zone 고정 vs 편집
> "벽산1단지~벽산6단지"를 코드에서 고정할까요, UI에서 편집 가능하게 할까요?
>
> **Option A**: 고정 (현재) — 단순
> **Option B**: editable zone names (JSON fallback)
> **Option C**: zone을 'slot count only'로 단순화 (벽산1단지 = 2인 등 미리 정의된 preset)

---

*Report generated: 2026-11-24 | Target: mooneye/ (Delivery Matcher)*
