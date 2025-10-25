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
    <aside className="sticky top-20 min-w-56 w-56 flex flex-col gap-6">
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
        <div className="w-full flex flex-col gap-2 transition-all duration-300 ease-in-out">
          {CLASS_CATEGORY.map((menu) => (
            <Button
              key={menu.id}
              variant={"ghost"}
              className={`justify-start text-muted-foreground hover:text-white hover:pl-6 transition-all duration-500
              ${
                category === menu.category &&
                "text-foreground !pl-6 bg-accent/50"
              }`}
              onClick={() => setCategory(menu.category)}
            >
              {menu.icon}
              {menu.label}
            </Button>
          ))}
        </div>
      )}
    </aside>
  );
}

export { AppSidebar };
