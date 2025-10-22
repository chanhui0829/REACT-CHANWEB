import { NavLink } from "react-router";
import { Button } from "../ui";

function AppFooter() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {/* 1. 로고 및 서비스 소개 */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-3">Topic Insight</h3>
            <p className="text-sm leading-relaxed">
              커뮤니티 기반의 지식 공유 플랫폼
              <br /> 최신 트렌드와 인사이트를 발견하고 공유하세요.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Button variant={"outline"} size={"icon"} className="border-0">
                <img
                  src="/assets/icons/icon-001.png"
                  alt="@YOUTUBE"
                  className="w-8 h-8 p-1"
                />
              </Button>
              <NavLink to="https://github.com/chanhui0829" target="\_blank">
                <Button variant={"outline"} size={"icon"} className="border-0">
                  <img
                    src="/assets/icons/icon-002.png"
                    alt="@THREAD"
                    className="w-8 h-8"
                  />
                </Button>
              </NavLink>
            </div>
            <div className="flex space-x-4 mt-4">
              {/* 소셜 미디어 아이콘 자리 (클릭 불가한 <div>로 대체) */}
              <div className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                {/*  대신 실제 아이콘 컴포넌트를 사용해야 합니다 */}
                <span className="sr-only">GitHub</span>
              </div>
              {/* 필요한 다른 아이콘 추가 */}
            </div>
          </div>

          {/* 2. 주요 탐색 (Navigation) */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">탐색</h4>
            <ul className="space-y-3">
              {/* ⭐️ <a> 대신 <div> 사용 및 호버 효과만 적용 ⭐️ */}
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  메인
                </div>
              </li>
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  모든 토픽
                </div>
              </li>
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  인기 태그
                </div>
              </li>
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  서비스 소개
                </div>
              </li>
            </ul>
          </div>

          {/* 3. 리소스/커뮤니티 (Resources) */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">커뮤니티</h4>
            <ul className="space-y-3">
              {/* ⭐️ <a> 대신 <div> 사용 및 호버 효과만 적용 ⭐️ */}
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  FAQ / 도움말
                </div>
              </li>
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  문의하기
                </div>
              </li>
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  커뮤니티 가이드
                </div>
              </li>
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  토픽 기여
                </div>
              </li>
            </ul>
          </div>

          {/* 4. 법률 및 기타 (Legal & Links) */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">정보</h4>
            <ul className="space-y-3">
              {/* ⭐️ <a> 대신 <div> 사용 및 호버 효과만 적용 ⭐️ */}
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  이용약관
                </div>
              </li>
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  개인정보처리방침
                </div>
              </li>
              <li>
                <div className="hover:text-emerald-400 transition-colors cursor-pointer">
                  사이트맵
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 섹션 */}
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-sm">
          <p>
            &copy; 2025 Topic Insight. All rights reserved. | Developed with
            React & Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
}

export { AppFooter };
