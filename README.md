🚀 1. 프로젝트 소개

CHANWEB은 사용자가 토픽(topic) 단위로 글을 작성하고 이를 공유할 수 있는 미니 블로그 플랫폼입니다.
BlockNote 기반의 본문 작성, 카테고리 필터, 검색, 페이지네이션, 좋아요·조회수 기능을 포함합니다.

🌿 2. 주요 기능
🔐 사용자 인증

Supabase Auth 기반 회원가입 / 로그인 / 로그아웃

UUID 기반 사용자 관리

로그인 상태를 Zustand 전역 상태로 관리

📝 토픽 CRUD

토픽 작성 / 수정 / 삭제

BlockNote 기반 본문 작성

카테고리 선택

상태 관리 (PUBLIC / TEMP)

썸네일 URL 등록

🔍 토픽 목록

검색

카테고리 필터

정렬(최신순 / 조회순 / 좋아요순)

페이지네이션

Skeleton UI

👍 좋아요 기능

사용자별 1회 좋아요 제한

좋아요 토글

topic_likes 테이블 기반

👀 조회수 기능

토픽 상세 페이지 접속 시 조회수 자동 증가

💬 댓글 기능

댓글 작성 / 삭제

comment_user_view 활용해 사용자 이메일 포함된 데이터 조회

🛠 3. 기술 스택
Frontend

React (Vite)

TypeScript

Zustand

React Query v5

React Router

Tailwind CSS

Shadcn UI

BlockNote Editor

Lucide Icons

Backend

Supabase

Postgres

RLS (Row Level Security)

RPC(Function) 일부 적용

🗄️ 4. 데이터베이스 구조
🧑‍💻 user
id (uuid)
email (text)
created_at (timestamp)
service_agreed (boolean)
privacy_agreed (boolean)
marketing_agreed (boolean)

📝 topic
id (bigint)
author (uuid)
title (text)
content (json or text)
category (text)
thumbnail (text)
status (PUBLIC | TEMP)
views (bigint)
created_at (timestamp)

💬 comment
id (bigint)
user_id (uuid)
topic_id (bigint)
content (text)
created_at (timestamp)

👍 topic_likes
id (bigint)
user_id (uuid)
topic_id (bigint)
created_at (timestamp)
UNIQUE(user_id, topic_id)

👁 comment_user_view
id (bigint)
content (text)
created_at (timestamp)
topic_id (bigint)
user_id (uuid)
user_email (text)

🔒 5. RLS 정책 요약
user
create policy "Users can select their own profile"
  on user for select
  using (auth.uid() = id);

topic

PUBLIC: 전체 조회 가능

TEMP: 작성자 본인만 조회 가능

UPDATE / DELETE: 작성자만 가능

topic_likes

SELECT / INSERT / DELETE: auth.uid() = user_id

comment

INSERT: 작성자 본인

DELETE: 작성자 본인

SELECT: PUBLIC 토픽의 댓글 전체 조회 가능

⚙️ 6. 성능 및 구조 개선 사항

React Query로 데이터 캐싱 및 요청 중복 제거

staleTime, keepPreviousData 기반 목록 fetching 최적화

Zustand 전역 상태 정리 및 불필요한 렌더링 최소화

useCallback / useMemo / memo 활용한 컴포넌트 최적화

Supabase 쿼리 구조 정리

기능별 커스텀 훅 분리

import 경로 및 폴더 구조 개선

📁 7. 폴더 구조
src/
 ├── components/
 │    ├── common/
 │    ├── topics/
 │    └── ui/
 ├── hooks/
 │    └── apis/
 ├── stores/
 ├── lib/
 │    └── supabase.ts
 ├── pages/ or router/
 ├── styles/
 └── types/

▶️ 8. 실행 방법
npm install
npm run dev


환경 변수(.env):

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

👤 9. 개발자 정보

Developer: 윤찬희

GitHub: https://github.com/chanhui0829

Repository: https://github.com/chanhui0829/REACT-CHANWEB
