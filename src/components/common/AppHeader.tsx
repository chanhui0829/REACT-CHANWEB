import { NavLink, useNavigate } from "react-router";
import { Separator } from "../ui";
import { useAuthStore } from "@/stores";
import { CircleUserRound } from "lucide-react";
import { toast } from "sonner";

function AppHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const reset = useAuthStore((state) => state.reset);

  const handleLogout = async () => {
    try {
      await reset(); //Zustand + Supabase 모두 로그아웃
      toast.success("로그아웃 되었습니다.");
      navigate("/sign-in");
    } catch (error) {
      console.error(error);
      toast.error("로그아웃 중 오류가 발생하였습니다.");
    }
  };

  return (
    <header className="fixed top-0 z-20 w-full flex items-center justify-center bg-[#121212]">
      <div className="w-full max-w-[1328px] flex items-center justify-between px-6 py-2">
        {/* 로고 & 네비게이션 UI */}
        <div className="flex items-center gap-5">
          <img src="/assets/icons/chan.png" alt="@LOGO" className="w-18 h-12" />
          <div className="flex items-center gap-5">
            <NavLink to={"/"} className="font-semibold">
              토픽 인사이트
            </NavLink>
          </div>
        </div>
        {user ? (
          <div className="flex items-center gap-5">
            <div className="flex gap-1">
              <CircleUserRound size={16} className="m-0.5" />
              <span>{user.email}님</span>
            </div>
            <Separator orientation="vertical" className="!h-4" />
            <span
              className="hover:scale-110 transition-all duration-150 cursor-pointer"
              onClick={handleLogout}
            >
              로그아웃
            </span>
          </div>
        ) : (
          <div className="flex justify-end gap-4 ">
            <div className="hover:scale-110 transition-all duration-150">
              <NavLink to={"/sign-in"}>로그인</NavLink>
            </div>
            <div className="hover:scale-110 transition-all duration-150">
              <NavLink to={"/sign-up"}>회원가입</NavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export { AppHeader };
