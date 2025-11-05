import { NavLink } from "react-router";
import { Button } from "../ui";

// ------------------------------
// 🔹 AppFooter 컴포넌트
// ------------------------------
function AppFooter() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {/* 1️⃣ 로고 및 서비스 소개 */}
          <section className="col-span-2 lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-3">Topic Insight</h3>
            <p className="text-sm leading-relaxed">
              커뮤니티 기반의 지식 공유 플랫폼
              <br />
              최신 트렌드와 인사이트를 발견하고 공유하세요.
            </p>

            {/* 소셜 아이콘 */}
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="icon" className="border-0">
                <img
                  src="/assets/icons/icon-001.png"
                  alt="@YOUTUBE"
                  className="w-8 h-8 p-1"
                />
              </Button>

              <NavLink
                to="https://github.com/chanhui0829"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="icon" className="border-0">
                  <img
                    src="/assets/icons/icon-002.png"
                    alt="@GITHUB"
                    className="w-8 h-8"
                  />
                </Button>
              </NavLink>
            </div>
          </section>

          {/* 2️⃣ 주요 탐색 */}
          <nav>
            <h4 className="text-lg font-semibold text-white mb-4">탐색</h4>
            <ul className="space-y-3 text-sm">
              {["메인", "모든 토픽", "인기 태그", "서비스 소개"].map(
                (label, i) => (
                  <li key={i}>
                    <NavLink
                      to="/"
                      className="block hover:text-emerald-400 hover:translate-x-1 transition-all duration-200"
                    >
                      {label}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </nav>

          {/* 3️⃣ 커뮤니티 */}
          <nav>
            <h4 className="text-lg font-semibold text-white mb-4">커뮤니티</h4>
            <ul className="space-y-3 text-sm">
              {["FAQ / 도움말", "문의하기", "커뮤니티 가이드", "토픽 기여"].map(
                (label, i) => (
                  <li key={i}>
                    <NavLink
                      to="/"
                      className="block hover:text-emerald-400 hover:translate-x-1 transition-all duration-200"
                    >
                      {label}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </nav>

          {/* 4️⃣ 정보 및 정책 */}
          <nav>
            <h4 className="text-lg font-semibold text-white mb-4">정보</h4>
            <ul className="space-y-3 text-sm">
              {["이용약관", "개인정보처리방침", "사이트맵"].map((label, i) => (
                <li key={i}>
                  <NavLink
                    to="/"
                    className="block hover:text-emerald-400 hover:translate-x-1 transition-all duration-200"
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 5️⃣ 하단 저작권 */}
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-xs sm:text-sm text-zinc-500">
          <p>
            &copy; 2025{" "}
            <span className="text-white font-medium">Topic Insight</span>. All
            rights reserved. | Developed with{" "}
            <span className="text-emerald-400">React</span> &{" "}
            <span className="text-emerald-400">Tailwind CSS</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}

export { AppFooter };
