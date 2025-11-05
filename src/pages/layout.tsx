import { Outlet } from "react-router";
import { AppHeader, AppFooter } from "@/components/common";
import useAuthListener from "@/hooks/use-auth";
import { useEffect } from "react";

export default function RootLayout() {
  // ✅ Supabase 세션 변화 감지 → Zustand 동기화
  useAuthListener();

  // ✅ 페이지 이동 시 항상 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="page">
      {/* 헤더 */}
      <AppHeader />

      {/* 본문 컨테이너 */}
      <div className="container">
        <Outlet />
      </div>

      {/* 푸터 */}
      <AppFooter />
    </div>
  );
}
