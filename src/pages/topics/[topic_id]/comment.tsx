import { useEffect, useRef, useCallback, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { CircleUserRound, MessageSquareMore, ChevronsDown } from 'lucide-react';
import { toast } from 'sonner';

import supabase from '@/lib/supabase';
import { Separator, Textarea, Button } from '@/components/ui';
import { AppDeleteDialog } from '@/components/common';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export default function CommentBox({ topicId }: { topicId: number }) {
  const queryClient = useQueryClient();
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const newCommentRef = useRef<HTMLTextAreaElement | null>(null);

  // ---------------------------------------------------------
  // 🔥 로그인한 유저
  // ---------------------------------------------------------
  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  };

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchUser,
    staleTime: Infinity,
  });
  const currentUser = user || null;

  // ---------------------------------------------------------
  // 🔥 댓글 총 개수 카운트
  // ---------------------------------------------------------
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['commentCount', topicId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('comment')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicId);

      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 2000,
  });

  // ---------------------------------------------------------
  // 🔥 Infinite Query — 최신순 댓글 로드
  // ---------------------------------------------------------
  const fetchComments = async ({ pageParam }: { pageParam: number }) => {
    const from = pageParam;
    const to = from + 5;

    const { data, error } = await supabase
      .from('comment_user_view')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false }) // ⭐ 최신순 정렬
      .range(from, to);

    if (error) throw error;

    return {
      comments: data,
      nextOffset: data.length === 6 ? to + 1 : null,
    };
  };

  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ['comments', topicId],
    queryFn: fetchComments,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    initialPageParam: 0,
    staleTime: 0,
  });

  const comments = data?.pages.flatMap((page) => page.comments) ?? [];

  // ---------------------------------------------------------
  // 🔥 댓글 작성 (중복 저장 문제 해결 포함)
  // ---------------------------------------------------------
  const [preventDoubleSubmit, setPreventDoubleSubmit] = useState(false);

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        toast.error('로그인이 필요합니다.');
        throw new Error('Not logged in');
      }

      const { data, error } = await supabase
        .from('comment')
        .insert({
          content: text,
          topic_id: topicId,
          user_id: user.id,
        })
        .select('*')
        .single();

      if (error) throw error;

      return { ...data, email: user.email };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', topicId] });
      queryClient.invalidateQueries({ queryKey: ['commentCount', topicId] });

      toast.success('댓글이 등록되었습니다.');
      if (newCommentRef.current) newCommentRef.current.value = '';

      setPreventDoubleSubmit(false);
    },

    onError: () => {
      toast.error('댓글 등록 중 오류가 발생했습니다.');
      setPreventDoubleSubmit(false);
    },
  });

  // ---------------------------------------------------------
  // 🔥 Enter → 댓글 작성 (IME 한글 입력 보호 + 중복방지)
  // ---------------------------------------------------------
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return; // ⭐ 한글 조합 중 Enter 방지

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation(); // 버튼까지 이벤트 전파 방지

      const text = newCommentRef.current?.value?.trim();
      if (!text) return toast.warning('댓글 내용을 입력하세요.');

      if (preventDoubleSubmit) return; // ⭐ 중복 방지

      setPreventDoubleSubmit(true);
      addCommentMutation.mutate(text);
    }
  };

  // ---------------------------------------------------------
  // 🔥 삭제
  // ---------------------------------------------------------
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const { error } = await supabase.from('comment').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', topicId] });
      queryClient.invalidateQueries({ queryKey: ['commentCount', topicId] });
      toast.success('댓글이 삭제되었습니다.');
    },
    onError: () => {
      toast.error('댓글 삭제 중 오류가 발생했습니다.');
    },
  });

  // ---------------------------------------------------------
  // 🔥 무한 스크롤 옵저버
  // ---------------------------------------------------------
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasNextPage) fetchNextPage();
    },
    [hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, { threshold: 1 });
    const current = loaderRef.current;

    if (current) observer.observe(current);

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [observerCallback]);

  // ---------------------------------------------------------
  // 🔥 렌더링
  // ---------------------------------------------------------
  return (
    <section className="w-full max-w-3xl mx-auto mt-6">
      {/* 타이틀 */}
      <div className="flex gap-2 pl-3 mb-4">
        <MessageSquareMore className="size-8 text-zinc-200 mt-0.5" />
        <div className="flex font-semibold text-lg text-neutral-400 mt-1 gap-1">
          <p>댓글</p>
          <p className="font-bold text-white">{totalCount}</p>개
        </div>
      </div>

      {/* 입력 */}
      <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl shadow-lg mb-5">
        <Textarea
          ref={newCommentRef}
          onKeyDown={handleKeyDown}
          placeholder="댓글을 입력해주세요... ✨"
          className="min-h-[90px] bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-500"
        />

        <div className="flex justify-end mt-3">
          <Button
            onClick={() => {
              const text = newCommentRef.current?.value?.trim();
              if (!text) return toast.warning('댓글 내용을 입력하세요.');

              if (preventDoubleSubmit) return;

              setPreventDoubleSubmit(true);
              addCommentMutation.mutate(text);
            }}
            disabled={addCommentMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg shadow-md"
          >
            {addCommentMutation.isPending ? '등록중...' : '등록'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* 리스트 */}
      <div className="mt-6 space-y-4">
        {status === 'pending' ? (
          <p className="text-zinc-600 text-center">불러오는 중...</p>
        ) : comments.length === 0 ? (
          <p className="text-zinc-600 text-center">등록된 댓글이 없습니다. 🚀</p>
        ) : (
          comments.map((c) => {
            const isOwner = c.user_id === currentUser?.id;

            return (
              <article
                key={c.id}
                className={`p-4 rounded-xl transition-all shadow-lg ${
                  isOwner
                    ? 'bg-zinc-900 border border-transparent ring-1 ring-zinc-500/40'
                    : 'bg-zinc-900 border border-zinc-800'
                }`}
              >
                <header className="flex justify-between items-center mb-3">
                  <div className="flex gap-3 items-center">
                    <CircleUserRound className="size-6 text-zinc-400" />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-white flex items-center gap-1.5">
                        {c.email || 'Anonymous'}
                        {isOwner && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-900/30 px-2 rounded-full">
                            작성자
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {isOwner && (
                    <AppDeleteDialog
                      onConfirm={() => deleteCommentMutation.mutate(c.id)}
                      title="댓글을 삭제하시겠습니까?"
                      description="이 댓글은 복구할 수 없습니다."
                    />
                  )}
                </header>

                <p className="mt-3 text-zinc-100 whitespace-pre-wrap">{c.content}</p>
              </article>
            );
          })
        )}
      </div>

      {/* 더보기 */}
      {hasNextPage && (
        <div ref={loaderRef} className="flex justify-center py-6">
          <Button
            onClick={() => fetchNextPage()}
            variant="outline"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
          >
            <p className="pl-2">더보기</p>
            <ChevronsDown />
          </Button>
        </div>
      )}
    </section>
  );
}
