import { AppDraftsDialog, AppSidebar } from "../components/common";
import { useNavigate, useSearchParams } from "react-router";
import { useAuthStore } from "@/stores";
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
import { SORT_CATEGORY } from "@/constants/sort.constant";

function App() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";

  // ✅ 페이지 관련 상태
  const [currentPage, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ✅ 검색 및 정렬 상태
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("latest");

  // ✅ 토픽 관련 상태
  const [topics, setTopics] = useState<Topic[]>([]);
  const [hasDrafts, setHasDrafts] = useState<boolean>(false);

  // ⭐️ 임시 저장 토픽 존재 여부 확인
  const checkDraftExistence = async (userId: string) => {
    if (!userId) {
      setHasDrafts(false);
      return;
    }

    const { data, error } = await supabase
      .from("topic")
      .select("id")
      .eq("author", userId)
      .eq("status", TOPIC_STATUS.TEMP)
      .limit(1);

    if (error) {
      console.error("Draft Check Error:", error);
      setHasDrafts(false);
      return;
    }

    setHasDrafts(data?.length > 0);
  };

  // ✅ Supabase 기반 페이지네이션
  const fetchTopics = async () => {
    try {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("topic")
        .select("*", { count: "exact" })
        .eq("status", TOPIC_STATUS.PUBLISH);

      if (category && category.trim() !== "") {
        query = query.eq("category", category);
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

      if (error) {
        toast.error(error.message);
        return;
      }

      setTopics(data || []);
      if (count) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ 검색 실행
  const handleSearch = () => {
    if (searchInput.trim().length < 2) {
      toast.error("검색어를 두 글자 이상 입력해주세요. 😊");
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

  // ✅ 카테고리 변경
  const handleCategoryChange = (value: string) => {
    setSortOption("latest");
    setPage(1);
    setSearchQuery("");
    setSearchInput("");

    if (value === "") setSearchParams({});
    else setSearchParams({ category: value });
  };

  // ✅ 나만의 토픽 생성
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

  // ✅ 사용자 상태 변화 시 임시 저장 체크
  useEffect(() => {
    if (user?.id) {
      checkDraftExistence(user.id);
    } else {
      setHasDrafts(false);
    }

    const intervalId = setInterval(() => {
      if (user?.id) {
        checkDraftExistence(user.id);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user?.id]);

  // ✅ 데이터 불러오기
  useEffect(() => {
    fetchTopics();
  }, [category, sortOption, currentPage]);

  // ✅ 검색 필터링 (클라이언트에서 필터)
  const filteredTopics = topics.filter(
    (topic) =>
      topic.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="w-full h-full min-h-[720px] flex p-6 gap-6 mt-4">
      {/* floating 버튼 */}
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

      {/* 사이드바 */}
      <div className="hidden lg:block lg:min-w-60 lg:w-60 lg:h-full">
        <AppSidebar category={category} setCategory={handleCategoryChange} />
      </div>

      {/* 메인 콘텐츠 */}
      <section className="w-full lg:w-[calc(100%-264px)] flex-1 flex flex-col gap-12 mr-2">
        {/* 타이틀 */}
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

          {/* 토픽 카드 */}
          {filteredTopics.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredTopics.map((topic) => (
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
