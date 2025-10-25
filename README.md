# 💡 CHAN WEB \| 미니 블로그형 프로젝트

지식과 인사이트를 모아 **토픽 단위로 깊이 있게 나누는 미니 블로그형
플랫폼**입니다.\
React, Zustand, Supabase를 중심으로 사용자 인증, CRUD, 댓글, 좋아요 기능
등을 구현했습니다.

------------------------------------------------------------------------

## ⚙️ 기술 스택

**Frontend**\
- React, TypeScript, Vite, TailwindCSS, Shadcn UI

**State Management**\
- Zustand

**Backend & DB**\
- Supabase (PostgreSQL)\
- Auth & API / RLS Policy / Edge Function

**Deploy & UX**\
- Vercel\
- Responsive UI / Dark Mode / Toast 알림 / Lazy Loading

------------------------------------------------------------------------

## 🍀 주요 기능

👤 **사용자 인증**\
Supabase Auth를 활용한 회원가입 / 로그인 / 로그아웃\
UUID 기반 사용자 식별 및 정책 기반 접근 제어

🗂 **토픽 CRUD**\
토픽 작성, 수정, 삭제, 조회 기능\
카테고리 및 상태(공개/비공개) 관리, 썸네일 이미지 포함

💬 **댓글(Comment)**\
`comment_user_view` 뷰(View)를 통해 user, topic을 JOIN하여\
사용자 이메일과 함께 댓글 조회

❤️ **좋아요(Like)**\
`topic_likes` 테이블 기반\
`user_id + topic_id` 조합으로 중복 방지 및 실시간 반영

👁 **조회수(View)**\
토픽 클릭 시 자동 조회수 증가

------------------------------------------------------------------------

## 🧱 데이터베이스 구조

### 🧩 user

    id uuid (PK)  
    created_at timestamp  
    service_agreed bool  
    privacy_agreed bool  
    marketing_agreed bool  
    email text  

### 🧩 topic

    id int8 (PK)  
    created_at timestamp  
    author uuid (FK → user.id)  
    content text  
    category text  
    thumbnail text  
    status text  
    views int8  
    likes int8  

### 🧩 comment

    id int8 (PK)  
    created_at timestamp  
    content text  
    user_id uuid (FK → user.id)  
    topic_id int8 (FK → topic.id)

### 🧩 topic_likes

    id int8 (PK)  
    user_id uuid (FK → user.id)  
    topic_id int8 (FK → topic.id)  
    created_at timestamp  

------------------------------------------------------------------------

## 🧮 ERD 요약

    user (1) ─── (N) topic  
    user (1) ─── (N) comment  
    user (1) ─── (N) topic_likes  
    topic (1) ─── (N) comment  
    topic (1) ─── (N) topic_likes  

------------------------------------------------------------------------

## 🚀 향후 개선 계획

-   Supabase Storage를 통한 이미지 업로드 기능 
-   댓글 수정 및 대댓글 구조 추가
-   다크/라이트 모드 전환
-   사용자 프로필 페이지 및 팔로우 기능  

------------------------------------------------------------------------

**By 윤찬희** 🪶
