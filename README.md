CHAN WEB — 토픽으로 나누는 인사이트 플랫폼

<img width="1436" height="749" alt="스크린샷 2025-10-25 오후 1 41 47" src="https://github.com/user-attachments/assets/254bb734-cce7-4279-86e2-22efbf2a7c19" />

📘 프로젝트 소개

CHAN WEB은 지식과 인사이트를 모아 ‘토픽’ 단위로 공유할 수 있는 미니 블로그형 플랫폼입니다.
React, Zustand, Supabase를 기반으로 사용자 인증, CRUD, 댓글, 좋아요 등
핵심적인 웹 서비스 기능을 직접 구현했습니다.

이 프로젝트는 포트폴리오 및 자기 개발 목적으로 진행되었으며,
Supabase의 실시간 데이터베이스와 React 상태 관리를 결합해
실제 배포 가능한 수준의 완성도를 목표로 했습니다.

⚙️ 기술 스택
구분	사용 기술
Frontend	React, TypeScript, Vite, TailwindCSS, Shadcn UI
State Management	Zustand
Backend & DB	Supabase (PostgreSQL)
Auth & API	Supabase Auth / RLS Policy / Edge Function
Deploy	Vercel
ETC	Responsive UI / Dark Mode / Toast 알림 / Lazy Loading
🧩 주요 기능
🧑‍💻 사용자 인증

Supabase Auth를 활용한 회원가입 / 로그인 / 로그아웃

UUID 기반 사용자 식별 및 정책 기반 접근 제어

📝 토픽 CRUD

토픽 작성, 수정, 삭제, 조회 기능

카테고리 및 상태(공개/비공개) 관리

썸네일 이미지 및 내용 포함

💬 댓글(Comment)

comment 테이블이 user, topic을 참조

comment_user_view 뷰(View)를 통해 사용자 이메일과 함께 댓글 조회

❤️ 좋아요(Like)

topic_likes 테이블을 활용해 좋아요 기능 구현

user_id + topic_id 조합으로 중복 방지

좋아요 수는 실시간 반영

👁 조회수(View)

토픽 클릭 시 조회수 자동 증가

🧱 데이터베이스 구조
user
컬럼	타입	설명
id	uuid	🔑 Primary Key
created_at	timestamp	생성 일시
service_agreed	bool	서비스 약관 동의
privacy_agreed	bool	개인정보 동의
marketing_agreed	bool	마케팅 동의
email	text	이메일 주소
topic
컬럼	타입	설명
id	int8	🔑 Primary Key
created_at	timestamp	생성 일시
author	uuid	🔗 Foreign Key → user.id
content	text	게시글 내용
category	text	카테고리명
thumbnail	text	썸네일 이미지 URL
status	text	상태 (공개/비공개 등)
views	int8	조회수
likes	int8	좋아요 수
comment
컬럼	타입	설명
id	int8	🔑 Primary Key
created_at	timestamp	생성 일시
content	text	댓글 내용
user_id	uuid	🔗 Foreign Key → user.id
topic_id	int8	🔗 Foreign Key → topic.id
topic_likes
컬럼	타입	설명
id	int8	🔑 Primary Key
user_id	uuid	🔗 Foreign Key → user.id
topic_id	int8	🔗 Foreign Key → topic.id
created_at	timestamp	생성 일시
🔗 관계 요약 (1:N 구조)
user (1) ─── (N) topic
user (1) ─── (N) comment
user (1) ─── (N) topic_likes
topic (1) ─── (N) comment
topic (1) ─── (N) topic_likes

💡 comment_user_view (참고용)

comment_user_view는 Supabase에서 제공하는 가상 테이블(View)로,
comment와 user를 JOIN하여 사용자 이메일을 포함한 댓글 데이터를 조회하기 위한 뷰입니다.
실제 ERD에는 포함되지 않지만, 조회 최적화를 위해 활용됩니다.

🚀 실행 방법
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 배포 (Vercel)
vercel deploy

🌱 향후 개선 계획

Supabase Storage를 통한 이미지 업로드 기능

댓글 수정 및 대댓글 구조 추가

다크/라이트 모드 전환

사용자 프로필 페이지 및 팔로우 기능

✍️ 개발자 정보

By 윤찬희
📎 GitHub: React-CHANWEB
