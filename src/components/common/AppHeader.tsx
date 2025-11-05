import { NavLink, useNavigate } from "react-router";
import { CircleUserRound } from "lucide-react";
import { toast } from "sonner";

// store & ui
import { useAuthStore } from "@/stores";
import { Separator } from "../ui";

// ------------------------------
// 🔹 AppHeader 컴포넌트
// ------------------------------
function AppHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const reset = useAuthStore((state) => state.reset);

  // ------------------------------
  // 🔹 로그아웃 처리
  // ------------------------------
  const handleLogout = async () => {
    try {
      await reset(); // Zustand + Supabase 모두 로그아웃
      toast.success("로그아웃 되었습니다.");
      navigate("/sign-in");
    } catch (err) {
      console.error(err);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // ------------------------------
  // 🔹 UI 렌더링
  // ------------------------------
  return (
    <header className="fixed top-0 z-20 w-full flex items-center justify-center bg-[#121212]">
      <div className="w-full max-w-[1328px] flex items-center justify-between px-6 py-2">
        {/* ✅ 로고 + 네비게이션 */}
        <div className="flex items-center gap-5">
          <img
            src="/assets/icons/chan.png"
            alt="@LOGO"
            className="w-18 h-12 object-contain"
          />
          <nav className="flex items-center gap-5">
            <NavLink to="/" className="font-semibold">
              토픽 인사이트
            </NavLink>
          </nav>
        </div>

        {/* ✅ 우측 사용자 메뉴 */}
        {user ? (
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              <CircleUserRound size={16} className="m-0.5" />
              <span>{user.email}님</span>
            </div>
            <Separator orientation="vertical" className="!h-4" />
            <button
              type="button"
              onClick={handleLogout}
              className="hover:scale-110 transition-all duration-150 cursor-pointer"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <NavLink
              to="/sign-in"
              className="hover:scale-110 transition-all duration-150"
            >
              로그인
            </NavLink>
            <NavLink
              to="/sign-up"
              className="hover:scale-110 transition-all duration-150"
            >
              회원가입
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}

export { AppHeader };
