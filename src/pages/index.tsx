import { AppDraftsDialog, AppSidebar } from "../components/common";

import { useNavigate, useSearchParams } from "react-router";
import { useAuthStore, usePaginationStore } from "@/stores";
import { toast } from "sonner";
import supabase from "@/lib/supabase";
import {
  CircleSmall,
  NotebookPen,
  PencilLine,
  Search,
  Funnel,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TOPIC_STATUS, type Topic } from "@/types/topic.type";
import { TopicCard } from "@/components/topics";
import {
  Button,
  Input,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui";

const SORT_CATEGORY = [
  { id: 1, label: "최신순", sortOption: "latest" },
  { id: 2, label: "좋아요순", sortOption: "likes" },
  { id: 3, label: "조회순", sortOption: "views" },
];

function App() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const { currentPage, setPage } = usePaginationStore();

  const [searchInput, setSearchInput] = useState(""); // 입력 중 값
  const [searchQuery, setSearchQuery] = useState(""); // 실제 검색 실행 값
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";

  const [topics, setTopics] = useState<Topic[]>([]);

  // ⭐️ [수정 1] 임시 저장 토픽 존재 여부 상태
  const [hasDrafts, setHasDrafts] = useState<boolean>(false);
  //검색어
  const [sortOption, setSortOption] = useState<string>("latest");

  // ⭐️ [수정 2] 임시 저장 토픽 존재 여부를 가져오는 함수
  const checkDraftExistence = async (userId: string) => {
    if (!userId) {
      setHasDrafts(false);
      return;
    }

    // 데이터 하나만 확인할 때는 count를 쓰지 않고 limit(1)로 효율을 높일 수 있습니다.
    const { data, error } = await supabase
      .from("topic")
      .select("id")
      .eq("author", userId)
      .eq("status", TOPIC_STATUS.TEMP) // 임시 저장 상태(발행 안 됨)
      .limit(1);

    if (error) {
      console.error("Draft Check Error:", error);
      setHasDrafts(false);
      return;
    }

    // ⭐️ 데이터가 1개 이상 있으면 true
    setHasDrafts(data?.length > 0);
  };

  //검색어가 있을 때 필터링
  const filteredTopics = topics.filter(
    (topic) =>
      topic.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //페이지네이션
  const ITEMS_PER_PAGE = 10;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTopics = filteredTopics.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredTopics.length / ITEMS_PER_PAGE);

  //카테고리 변경
  const handleCategoryChange = (value: string) => {
    setSortOption("latest");
    setPage(1);
    setSearchQuery(""); // 검색 결과 상태 초기화
    setSearchInput(""); // 검색창 비우기

    if (value === "") setSearchParams({});
    else setSearchParams({ category: value });
  };

  //발행된 토픽 조회
  const fetchTopics = async () => {
    try {
      const query = supabase
        .from("topic")
        .select("*")
        .eq("status", TOPIC_STATUS.PUBLISH);

      if (category && category.trim() !== "") query.eq("category", category);

      // ✅ 정렬 기준에 따라 조건 분기
      const orderBy =
        sortOption === "likes"
          ? "likes"
          : sortOption === "views"
          ? "views"
          : "created_at";

      const { data: topics, error } = await query.order(orderBy, {
        ascending: false,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (topics) {
        setTopics(topics);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  //나만의 토픽 생성 버튼 클릭
  const handleRoute = async () => {
    if (!user) {
      toast.warning("토픽 작성은 로그인 후 가능합니다.");
      return;
    }

    const { data, error } = await supabase
      .from("topic")
      .insert([
        {
          status: null,
          title: null,
          content: null,
          category: null,
          thumbnail: null,
          author: user.id,
        },
      ])
      .select();

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      toast.success("토픽을 생성하였습니다.");
      navigate(`/topics/${data[0].id}/create`);
    }
  };

  // ✅ 검색 실행 함수
  const handleSearch = () => {
    if (searchInput.trim().length < 2) {
      toast.error("검색어를 두 글자 이상 입력해주세요. 😊");
      return;
    }
    fetchTopics();
    setSearchQuery(searchInput.trim());
    setPage(1); // 페이지 첫 페이지로 이동
  };

  // ✅ 엔터키 입력 시 검색
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // ⭐️ 사용자 ID가 로드될 때마다 존재 여부 확인
  useEffect(() => {
    if (user?.id) {
      checkDraftExistence(user.id);
    } else {
      setHasDrafts(false);
    }

    // 1분마다 새로고침하여 상태 업데이트
    const intervalId = setInterval(() => {
      if (user?.id) {
        checkDraftExistence(user.id);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user?.id]);

  useEffect(() => {
    fetchTopics();
  }, [category]);

  useEffect(() => {
    fetchTopics();
  }, [sortOption]);

  return (
    <main className="w-full h-full min-h-[720px] flex p-6 gap-6 mt-4">
      <div className="fixed flex gap-2 right-1/2 bottom-10 translate-x-1/2 z-20 items-center ">
        <Button
          variant={"destructive"}
          className="!py-5 !px-6 rounded-full transition-all duration-300 hover:scale-110"
          onClick={handleRoute}
        >
          <PencilLine />
          나만의 토픽 작성
        </Button>
        <AppDraftsDialog>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 p-0 shadow-lg border-2 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
            >
              <NotebookPen className="w-6 h-6" />
            </Button>

            {hasDrafts && (
              <CircleSmall
                className="absolute top-0 right-0 text-red-500"
                fill="#EF4444"
                size={14}
              />
            )}
          </div>
        </AppDraftsDialog>
      </div>
      {/* 카테고리 사이드바 */}
      <div className="hidden lg:block lg:min-w-60 lg:w-60 lg:h-full ">
        <AppSidebar category={category} setCategory={handleCategoryChange} />
      </div>
      {/* 토픽 콘텐츠 */}
      <section className="w-full lg:w-[calc(100%-264px)] flex-1 flex flex-col gap-12 mr-2">
        {/* UI 개선: 타이틀 중앙 정렬 및 여백 추가 */}
        <div className="flex flex-col gap-1 justify-center items-center mb-10">
          <div className="flex items-center gap-4">
            <img
              src="/assets/gifs/gif-002.gif"
              alt="@IMG2"
              className="w-14 h-14"
            />
            <h1 className="text-3xl font-semibold tracking-tight scroll-m-20 mt-4">
              지식과 인사이트를 모아, <br />
              토픽으로 깊이 있게 나누세요!
            </h1>
          </div>
        </div>

        <div className="flex justify-center w-full mb-10">
          <div className="relative w-full max-w-2xl">
            <div
              className="
            flex items-center
            rounded-full shadow-md border border-zinc-200 dark:border-zinc-700 
            focus-within:shadow-lg focus-within:shadow-zinc-600 transition-all duration-300
            overflow-hidden bg-black
            focus-within:ring-2 focus-within:ring-zinc-500 
          "
            >
              <Search
                size={18}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none "
              />
              <Input
                type="text"
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="토픽 제목 또는 내용을 입력하세요."
                className="
              flex-1 h-14 border-none pl-14 
              text-zinc-900 dark:text-zinc-100 !text-[16px]
              placeholder:text-zinc-400 dark:placeholder:text-zinc-500  placeholder:text-[16px]
              focus-visible:ring-0 focus-visible:outline-none
            "
              />
              <Button
                onClick={handleSearch}
                className="
                h-14 rounded-none rounded-r-full pl-5 
              bg-zinc-400 hover:bg-emerald-500
              dark:bg-zinc-800 dark:hover:bg-zinc-700
              text-white font-semibold flex items-center gap-1
              transition-all duration-300
            "
              >
                <p className="pr-2 tracking-[2px]">검색</p>
              </Button>
            </div>
          </div>
        </div>

        {/* 토픽 & 정렬 기능 */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex w-full justify-end px-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Funnel size={15} className="text-zinc-400 mb-0.5" />
                <p className="text-xs text-zinc-400">정렬 기준</p>
              </div>
              <Select
                value={sortOption}
                onValueChange={(value) => setSortOption(value)}
              >
                <SelectTrigger className="w-40 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SORT_CATEGORY.map((item) => {
                      return (
                        <SelectItem key={item.id} value={item.sortOption}>
                          {item.label}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 토픽 카드 그리드 - UI 개선: gap-8로 간격 확대 */}
          {paginatedTopics.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {paginatedTopics.map((topic) => (
                <TopicCard key={topic.id} props={topic} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-10">
              {searchQuery
                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                : "조회 가능한 토픽이 없습니다."}
            </p>
          )}
        </div>

        {/* 페이지네이션 구현 */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </main>
  );
}

export default App;
