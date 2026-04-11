# Moto Logbook — Claude Code Guide

오토바이 차계부(관리 앱) 프로젝트입니다. 사용자가 오토바이를 등록하고 주유, 정비, 보험/세금, 비용 등을 기록·조회할 수 있습니다.

## 프로젝트 구조

```
moto-logbook/
├── backend/          # Express + TypeScript + Prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── jobs/
│   │   ├── lib/
│   │   └── index.ts
│   └── prisma/
│       └── schema.prisma
└── frontend/         # React 18 + TypeScript + Vite
    └── src/
        ├── api/
        ├── components/
        ├── contexts/
        ├── pages/
        ├── types/
        └── lib/
```

## 기술 스택

### Backend
- **Runtime**: Node.js + TypeScript (tsx watch)
- **Framework**: Express
- **ORM**: Prisma (PostgreSQL)
- **Auth**: JWT (access token + refresh token)
- **Storage**: AWS S3 (Cloudflare R2 호환) — 이미지 업로드
- **Validation**: Zod
- **보안**: helmet, cors, express-rate-limit

### Frontend
- **Framework**: React 18 + TypeScript
- **Bundler**: Vite (PWA 지원)
- **Routing**: React Router DOM v6
- **서버 상태**: TanStack Query v5
- **폼**: React Hook Form + Zod
- **스타일**: Tailwind CSS
- **차트**: Chart.js + react-chartjs-2

## 주요 도메인

| 도메인 | 설명 |
|--------|------|
| User | 회원가입, 로그인, 프로필 |
| Motorcycle | 오토바이 등록 및 관리 |
| FuelRecord | 주유 기록 |
| MaintenanceRecord | 정비 기록 |
| ExpenseRecord | 기타 지출 기록 |
| InsuranceTax | 보험/세금 기록 |
| Reminder | 정비·보험 만료 알림 |
| Photo | 오토바이 사진 |

## 개발 명령어

```bash
# 루트에서 프론트+백 동시 실행
npm run dev

# DB 관련
npm run db:migrate     # 마이그레이션
npm run db:generate    # Prisma 클라이언트 재생성
npm run db:studio      # Prisma Studio

# 빌드
npm run build
```

## 코드 작성 규칙

- 백엔드 라우트는 `backend/src/routes/`에, 컨트롤러 로직은 `backend/src/controllers/`에 분리
- API 입력값은 Zod 스키마로 검증
- 인증이 필요한 라우트는 `authMiddleware` 적용
- 프론트엔드 API 호출은 `frontend/src/api/` 아래에 도메인별로 모듈화
- 서버 상태는 TanStack Query로 관리, 로컬 UI 상태만 useState 사용
- 스타일은 Tailwind 유틸리티 클래스 사용 (별도 CSS 파일 최소화)
