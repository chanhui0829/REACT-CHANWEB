import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  CircleSmall,
  Funnel,
  NotebookPen,
  PencilLine,
  Search,
} from "lucide-react";

// Store & Utils
import { useAuthStore } from "@/stores";
import supabase from "@/lib/supabase";
import { TOPIC_STATUS, type Topic } from "@/types/topic.type";
import { SORT_CATEGORY } from "@/constants/sort.constant";

// Components
import { AppDraftsDialog, AppSidebar } from "@/components/common";
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
} from "@/components/ui";

function App() {
  // ======================
  // 🔹 상태 관리
  // ======================
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";

  const [topics, setTopics] = useState<Topic[]>([]);
  const [hasDrafts, setHasDrafts] = useState(false);

  const [currentPage, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("latest");

  // ======================
  // 🔹 유틸 함수
  // ======================
  const handleSupabaseError = (message?: string) => {
    toast.error(message || "알 수 없는 오류가 발생했습니다.");
  };

  const checkDraftExistence = useCallback(async (userId: string) => {
    if (!userId) return setHasDrafts(false);

    try {
      const { data, error } = await supabase
        .from("topic")
        .select("id", { count: "exact" })
        .eq("author", userId)
        .eq("status", TOPIC_STATUS.TEMP)
        .limit(1);

      if (error) throw error;
      setHasDrafts((data?.length || 0) > 0);
    } catch {
      handleSupabaseError("임시 저장 토픽 확인 중 오류가 발생했습니다.");
      setHasDrafts(false);
    }
  }, []);

  const [startIndex, endIndex] = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return [start, start + ITEMS_PER_PAGE - 1];
  }, [currentPage]);

  const fetchTopics = useCallback(async () => {
    try {
      let query = supabase
        .from("topic")
        .select("*", { count: "exact" })
        .eq("status", TOPIC_STATUS.PUBLISH);

      if (category) query = query.eq("category", category);

      if (searchQuery.trim() !== "") {
        query = query.or(
          `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
        );
      }

      const orderBy =
        sortOption === "likes"
          ? "likes"
          : sortOption === "views"
          ? "views"
          : "created_at";

      const { data, error, count } = await query
        .order(orderBy, { ascending: false })
        .range(startIndex, endIndex);

      if (error) throw error;

      setTopics(data || []);
      if (count) setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    } catch {
      handleSupabaseError("토픽을 불러오는 중 오류가 발생했습니다.");
    }
  }, [category, sortOption, currentPage, searchQuery, startIndex, endIndex]);

  const handleSearch = () => {
    if (searchInput.trim().length < 2) {
      toast.warning("검색어를 두 글자 이상 입력해주세요. 😊");
      return;
    }
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleCategoryChange = (value: string) => {
    setSortOption("latest");
    setPage(1);
    setSearchQuery("");
    setSearchInput("");

    if (value === "") setSearchParams({});
    else setSearchParams({ category: value });
  };

  const handleRoute = async () => {
    if (!user) {
      toast.warning("토픽 작성은 로그인 후 가능합니다.");
      return;
    }

    try {
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
        .select("id")
        .single();

      if (error) throw error;

      if (data) {
        toast.success("토픽을 생성하였습니다.");
        navigate(`/topics/${data.id}/create`);
      }
    } catch {
      handleSupabaseError("토픽 생성 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (user?.id) checkDraftExistence(user.id);
    else setHasDrafts(false);
  }, [user?.id, checkDraftExistence]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const visiblePages = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  // ======================
  // 🔹 UI 렌더링
  // ======================
  return (
    <main className="w-full h-full min-h-[720px] flex flex-col lg:flex-row p-6 gap-6 mt-4">
      {/* ✅ 작은 화면용 상단 가로 스크롤 카테고리 바 */}
      <div className="lg:hidden w-full mb-4 sticky top-[72px] z-50">
        <AppSidebar category={category} setCategory={handleCategoryChange} />
      </div>

      {/* ✅ 큰 화면용 사이드바 */}
      <aside className="hidden lg:block lg:min-w-60 lg:w-60 lg:h-full">
        <AppSidebar category={category} setCategory={handleCategoryChange} />
      </aside>

      {/* ✅ 메인 콘텐츠 */}
      <section className="w-full lg:w-[calc(100%-264px)] flex-1 flex flex-col gap-12 mr-2">
        {/* Floating 버튼 */}
        <div className="fixed flex gap-2 right-1/2 bottom-10 translate-x-1/2 z-20 items-center">
          <Button
            variant="destructive"
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

        {/* 헤더 */}
        <header className="flex flex-col gap-1 justify-center items-center">
          <div className="flex items-center gap-4">
            <img
              src="/assets/gifs/gif-002.gif"
              alt="@IMG2"
              className="w-14 h-14"
            />
            <h1 className="text-3xl font-semibold tracking-tight scroll-m-20 mt-4 text-center">
              지식과 인사이트를 모아, <br />
              토픽으로 깊이 있게 나누세요!
            </h1>
          </div>
        </header>

        {/* 검색창 */}
        <div className="flex justify-center w-full mb-10">
          <div className="relative w-full max-w-2xl">
            <div
              className="flex items-center rounded-full shadow-md border border-zinc-200 
              dark:border-zinc-700 focus-within:shadow-lg focus-within:shadow-zinc-600 
              transition-all duration-300 overflow-hidden bg-black focus-within:ring-2 
              focus-within:ring-zinc-500"
            >
              <Search
                size={18}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
              />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="토픽 제목 또는 내용을 입력하세요."
                className="flex-1 h-14 border-none pl-14 text-zinc-900 dark:text-zinc-100 !text-[16px]
                placeholder:text-zinc-400 dark:placeholder:text-zinc-500 placeholder:text-[16px]
                focus-visible:ring-0 focus-visible:outline-none"
              />
              <Button
                onClick={handleSearch}
                className="h-14 rounded-none rounded-r-full pl-5 bg-zinc-400 hover:bg-emerald-500
                dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold flex items-center gap-1
                transition-all duration-300"
              >
                <p className="pr-2 tracking-[2px]">검색</p>
              </Button>
            </div>
          </div>
        </div>

        {/* 정렬 + 토픽 리스트 */}
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
                    {SORT_CATEGORY.map((item) => (
                      <SelectItem key={item.id} value={item.sortOption}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {topics.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {topics.map((topic) => (
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

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>

              {visiblePages.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={() => setPage(page)}
                  >
                    {page}
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
