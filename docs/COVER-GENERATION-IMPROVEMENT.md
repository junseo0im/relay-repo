# 표지 생성 플로우 개선 제안

> **작성일**: 2026-02-05  
> **배경**: 완성하기 → 표지 생성 분리, API 실패 대안, Hugging Face Inference API 검토

---

## 1. 현재 플로우 vs 제안 플로우

### 현재
```
스토리 상세 → [완성하기] 클릭 → completeStory() → 같은 페이지 유지
                                    ↓
              CoverSection에 "표지 생성" 버튼 노출 (스크롤 필요)
                                    ↓
              [표지 생성] 클릭 → /api/cover → 성공/실패 (에러만 표시)
```

**문제점**
- 완성 직후 표지 생성이 자연스럽지 않음 (같은 페이지에 섞여 있음)
- API 실패 시 "다시 시도" 외 대안 없음
- Pollinations/Replicate/Gemini 전부 실패 시 사용자 막힘

### 제안
```
스토리 상세 → [완성하기] 클릭 → completeStory() → /story/[id]/cover 로 리다이렉트
                                    ↓
              전용 표지 생성 페이지
              - 로딩 애니메이션
              - 자동 생성 시도 (또는 "생성 시작" 버튼)
              - 실패 시: Unsplash placeholder / 직접 업로드 / 나중에 하기
              - 성공 시: 미리보기 → [완성 작품으로 이동]
```

---

## 2. 표지 생성 전용 페이지 설계

### 라우트: `/story/[id]/cover`

| 요소 | 설명 |
|------|------|
| **접근 조건** | `is_completed=true`, `created_by=auth.uid()` |
| **레이아웃** | 스토리 제목, 장르, 간단한 미리보기 + 표지 영역 |
| **자동 시도** | 페이지 진입 시 1회 자동 생성 시도 (또는 버튼 클릭) |
| **로딩** | 30~90초 예상 → "AI가 표지를 그리고 있어요" 애니메이션 |
| **성공** | 표지 미리보기 + "완성 작품 보기" / "다시 생성" |
| **실패** | 대안 3가지 제시 (아래 참고) |

### API 실패 시 대안 (구현됨)

| 대안 | 설명 | 구현 |
|------|------|------|
| **1. HF Inference API** | Hugging Face FLUX.1-schnell | `HUGGINGFACE_TOKEN` 필요 |
| **2. 나중에 하기** | 표지 없이 완성 작품으로 이동 | `cover_image=null` 유지, 나중에 스토리 상세에서 다시 시도 |

---

## 3. Hugging Face Inference API vs 현재 스택

### 현재 (Pollinations → Replicate → Gemini)

| 서비스 | 장점 | 단점 |
|--------|------|------|
| **Pollinations** | 무료, API 키 불필요 | 불안정, 타임아웃 빈번, 한국어 프롬프트 약함 |
| **Replicate** | FLUX Schnell, 품질 좋음 | $5 무료 후 유료, 토큰 필요 |
| **Gemini** | Google, 이미지 생성 지원 | 할당량 제한, API 키 필요 |

### Hugging Face Inference API

| 항목 | 내용 |
|------|------|
| **지원 모델** | FLUX.1-Krea-dev, SDXL-Lightning, Qwen-Image 등 |
| **인증** | HF 토큰 (Inference Providers 권한) |
| **가격** | Serverless: 사용량 기반, 무료 티어 있음 |
| **안정성** | Pollinations보다 공식 API라 안정적 |
| **품질** | FLUX/SDXL 계열 → Replicate와 유사 수준 |

### 결론: HF Inference API 추가 권장

- **Pollinations가 계속 실패한다면** HF를 1순위 또는 2순위로 추가
- `HUGGINGFACE_TOKEN` 환경 변수로 활성화
- fallback 순서 제안: **HF → Replicate → Pollinations → Gemini**
- HF는 `huggingface_hub` 또는 REST API로 호출 가능

```typescript
// HF Inference API 예시 (text-to-image)
const res = await fetch(
  `https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  }
)
// 응답: binary image
```

**주의**: `FLUX.1-schnell`은 Inference API에서 지원 여부 확인 필요. `FLUX.1-Krea-dev` 등 문서 권장 모델 사용.

---

## 4. 구현 체크리스트

### Phase 1: 플로우 분리
- [ ] `completeStory` 성공 시 `router.push(`/story/${roomId}/cover`)` 리다이렉트
- [ ] `app/story/[id]/cover/page.tsx` 생성
- [ ] CoverSection "표지 생성" 버튼 → `/story/[id]/cover` 링크로 변경 (기존 경로 유지)

### Phase 2: 실패 대안
- [ ] Unsplash placeholder: `GET https://source.unsplash.com/600x800/?${genre},book,cover`
- [ ] 직접 업로드: `<input type="file">` + Supabase Storage upload
- [ ] "나중에 하기" 버튼 → `/story/[id]` 또는 `/completed` 이동

### Phase 3: HF Inference API (선택)
- [ ] `generateImageWithHuggingFace()` 함수 추가
- [ ] fallback 순서에 HF 삽입
- [ ] `HUGGINGFACE_TOKEN` env 문서화

---

## 5. 참고 링크

- [HF Inference API - Text to Image](https://huggingface.co/docs/inference-providers/tasks/text-to-image)
- [HF Inference API - Serverless](https://huggingface.co/docs/api-inference/)
- [Pollinations.ai](https://pollinations.ai/)
- [Unsplash Source (deprecated but still works)](https://source.unsplash.com/) → [Unsplash API](https://unsplash.com/developers) 권장 (무료 50 req/hr)
