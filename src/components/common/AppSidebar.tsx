import { CLASS_CATEGORY } from "@/constants/category.constant";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui";
import { useState } from "react";

interface Props {
  category: string;
  setCategory: (value: string) => void;
}

function AppSidebar({ category, setCategory }: Props) {
  const [isOpen, setIsOpen] = useState(true); // 전체 카테고리 열림/닫힘 상태
  const toggleCategoryList = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* ✅ 작은 화면: 상단 고정 가로 스크롤 카테고리 바 */}
      <div className="sm:hidden w-full overflow-x-auto hide-scrollbar bg-zinc-900 py-2 px-3 sticky top-16 z-40">
        <div className="flex gap-2">
          {CLASS_CATEGORY.map((menu) => {
            const isActive = category === menu.category;

            return (
              <Button
                key={menu.id}
                variant="ghost"
                onClick={() => setCategory(menu.category)}
                className={`flex-shrink-0 rounded-full px-4 py-2 whitespace-nowrap transition-all duration-300
                  ${
                    isActive
                      ? "bg-accent/70 text-white font-semibold ring-1 ring-accent/60"
                      : "text-muted-foreground hover:text-white bg-zinc-800/60"
                  }`}
              >
                {menu.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* ✅ 큰 화면: 기존 사이드바 */}
      <aside className="hidden sm:flex sticky top-20 min-w-56 w-56 flex-col gap-6">
        {/* 상단 제목 + 토글 */}
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={toggleCategoryList}
        >
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            카테고리
          </h4>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 mt-1 text-zinc-500" />
          ) : (
            <ChevronDown className="w-5 h-5 mt-1 text-zinc-500" />
          )}
        </div>

        {/* 카테고리 버튼 리스트 */}
        {isOpen && (
          <div className="flex flex-col gap-2 py-2">
            {CLASS_CATEGORY.map((menu) => {
              const isActive = category === menu.category;

              return (
                <Button
                  key={menu.id}
                  variant="ghost"
                  onClick={() => setCategory(menu.category)}
                  className={`justify-start transition-all duration-300
                    hover:text-white hover:pl-6
                    ${
                      isActive
                        ? "bg-accent/70 text-white font-semibold !pl-6 ring-1 ring-accent/60"
                        : "text-muted-foreground"
                    }`}
                >
                  {menu.icon}
                  <span className="ml-1">{menu.label}</span>
                </Button>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
}

export { AppSidebar };
