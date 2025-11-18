import { useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { CircleSmall, Funnel, NotebookPen, PencilLine, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Store & Utils
import { useAuthStore } from '@/stores';
import supabase from '@/lib/supabase';
import { TOPIC_STATUS, type Topic } from '@/types/topic.type';
import { SORT_CATEGORY } from '@/constants/sort.constant';

// Components
import { AppDraftsDialog, AppSidebar } from '@/components/common';
import { TopicCard } from '@/components/topics';
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
} from '@/components/ui';

// =============================================================
// 🔥 타입
// =============================================================
type TopicsResponse = {
  topics: Topic[];
  total: number;
};

// =============================================================
// 🔥 API
// =============================================================
async function fetchHasDrafts(userId: string) {
  const { data, error } = await supabase
    .from('topic')
    .select('id', { count: 'exact' })
    .eq('author', userId)
    .eq('status', TOPIC_STATUS.TEMP)
    .limit(1);

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

async function fetchTopics(filters: {
  category: string;
  searchQuery: string;
  sortOption: string;
  startIndex: number;
  endIndex: number;
}): Promise<TopicsResponse> {
  const { category, searchQuery, sortOption, startIndex, endIndex } = filters;

  let query = supabase
    .from('topic')
    .select('*', { count: 'exact' })
    .eq('status', TOPIC_STATUS.PUBLISH);

  if (category !== 'all') query = query.eq('category', category);

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
  }

  const orderBy =
    sortOption === 'likes' ? 'likes' : sortOption === 'views' ? 'views' : 'created_at';

  const { data, error, count } = await query
    .order(orderBy, { ascending: false })
    .range(startIndex, endIndex);

  if (error) throw new Error(error.message);

  return {
    topics: data ?? [],
    total: count ?? 0,
  };
}

// =============================================================
// 🔥 Component
// =============================================================
function App() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') ?? 'all';

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('latest');

  // =============================================================
  // 🔥 Pagination Index 계산
  // =============================================================
  const { startIndex, endIndex } = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return { startIndex: start, endIndex: start + ITEMS_PER_PAGE - 1 };
  }, [currentPage]);

  // =============================================================
  // 🔥 Query Key 안정화를 위한 filters
  // =============================================================
  const filters = useMemo(
    () => ({
      category,
      searchQuery,
      sortOption,
      startIndex,
      endIndex,
    }),
    [category, searchQuery, sortOption, startIndex, endIndex]
  );

  // =============================================================
  // 🔥 Drafts Check -> 저장 있을 시, 빨간점 ON
  // =============================================================
  const { data: hasDrafts = false } = useQuery({
    queryKey: ['drafts', user?.id],
    queryFn: () => fetchHasDrafts(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
  });

  // =============================================================
  // 🔥 토픽 리스트 Query
  // =============================================================
  const { data, isLoading } = useQuery({
    queryKey: ['topics', filters],
    queryFn: () => fetchTopics(filters),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60,
  });

  const topics = data?.topics ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / ITEMS_PER_PAGE);

  // =============================================================
  // 🔥 이벤트 핸들러
  // =============================================================
  const handleSearch = useCallback(() => {
    if (searchInput.trim().length < 2) {
      toast.warning('검색어를 두 글자 이상 입력해주세요.');
      return;
    }
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
  }, [searchInput]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      setSortOption('latest');
      setCurrentPage(1);
      setSearchQuery('');
      setSearchInput('');
      setSearchParams({ category: value || 'all' });
    },
    [setSearchParams]
  );

  const handleRoute = useCallback(() => {
    if (!user) {
      toast.warning('토픽 작성은 로그인 후 가능합니다.');
      return;
    }
    navigate('/topics/create');
  }, [user, navigate]);

  const visiblePages = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  // =============================================================
  // 🔥 렌더링
  // =============================================================
  return (
    <main className="w-full h-full min-h-[720px] flex flex-col lg:flex-row p-6 gap-6 mt-4">
      {/* 모바일 카테고리 */}
      <div className="lg:hidden w-full mb-4 sticky top-[72px] z-50">
        <AppSidebar category={category} setCategory={handleCategoryChange} />
      </div>

      {/* 데스크탑 카테고리 */}
      <aside className="hidden lg:block lg:min-w-60 lg:w-60 lg:h-full">
        <AppSidebar category={category} setCategory={handleCategoryChange} />
      </aside>

      {/* 메인 */}
      <section className="w-full flex-1 flex flex-col gap-12 mr-2">
        {/* Floating */}
        <div className="fixed flex gap-2 right-1/2 bottom-10 translate-x-1/2 z-20 items-center">
          <Button
            variant="destructive"
            className="!py-5 !px-6 rounded-full hover:scale-110 transition"
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
                className="rounded-full w-10 h-10 p-0 border-2 border-zinc-700 bg-zinc-800"
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
            <img src="/assets/gifs/gif-002.gif" className="w-14 h-14" />
            <h1 className="text-3xl font-semibold text-center mt-4">
              지식과 인사이트를 모아, <br />
              토픽으로 깊이 있게 나누세요!
            </h1>
          </div>
        </header>

        {/* 검색 */}
        <div className="flex justify-center w-full mb-10">
          <div className="relative w-full max-w-2xl">
            <div className="flex items-center rounded-full border border-zinc-700 bg-black overflow-hidden focus-within:ring-2 focus-within:ring-zinc-500">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" />

              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="토픽 제목 또는 내용을 입력하세요."
                className="flex-1 h-14 pl-14 border-none text-zinc-100"
              />

              <Button
                onClick={handleSearch}
                className="h-14 bg-zinc-400 rounded-none rounded-r-full pl-5"
              >
                <p className="pr-2 tracking-wide">검색</p>
              </Button>
            </div>
          </div>
        </div>

        {/* 리스트 */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex w-full justify-end px-2">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 items-center">
                <Funnel size={15} className="text-zinc-400" />
                <p className="text-xs text-zinc-400">정렬 기준</p>
              </div>

              <Select value={sortOption} onValueChange={setSortOption}>
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

          {isLoading ? (
            <p className="text-center text-muted-foreground mt-10">불러오는 중입니다...</p>
          ) : topics.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {topics.map((topic) => (
                <TopicCard key={topic.id} props={topic} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-10">
              {searchQuery
                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                : '조회 가능한 토픽이 없습니다.'}
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>

              {visiblePages.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
