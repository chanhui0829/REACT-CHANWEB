"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { KeyboardEvent } from "react";

import supabase from "@/lib/supabase";
import { Separator, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CircleUserRound, MessageSquareMore, ChevronsDown } from "lucide-react";
import { AppDeleteDialog } from "@/components/common";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  topic_id: number;
  user_id: string;
  email?: string | null;
}

export default function CommentBox({ topicId }: { topicId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ✅ 페이지네이션 및 로더 상태
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // ⭐️ [최종 수정] 현재 댓글 개수 및 hasMore 상태를 추적하는 Ref
  const commentsLengthRef = useRef(0);
  const hasMoreRef = useRef(true);
  const throttleTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. [useEffect #1] 로그인 유저 정보 로드 (마운트 시 1회)
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setCurrentUserId(data.user.id);
    };
    fetchUser();
  }, []);

  // 2. [useEffect #2] comments와 hasMore 상태 변화 시 Ref 업데이트 (통합)
  useEffect(() => {
    commentsLengthRef.current = comments.length;
    hasMoreRef.current = hasMore;
  }, [comments, hasMore]);

  // ✅ 댓글 불러오기 함수 (useCallback으로 안정화)
  const fetchComments = useCallback(
    async (from = 0, to = 5, append = false) => {
      const { data, error } = await supabase
        .from("comment_user_view")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true })
        .range(from, to);

      if (error) {
        console.error("댓글 불러오기 에러:", error);
        toast.error("댓글을 불러오지 못했습니다.");
        return;
      }

      const requestedCount = to - from + 1;
      setHasMore(data.length === requestedCount);

      setComments((prev) => {
        const merged = append ? [...prev, ...data] : data;

        // id 기준 중복 제거
        const unique = Array.from(
          new Map(merged.map((item) => [item.id, item])).values()
        );

        return unique;
      });
    },
    [topicId]
  );

  // 3. [useEffect #3] 초기 불러오기 (topicId 변경 시)
  useEffect(() => {
    fetchComments(0, 5, false);
    setHasMore(true);
  }, [topicId, fetchComments]);

  // ✅ “더보기” 로직 (Ref를 사용하여 현재 길이를 참조)
  const handleLoadMore = useCallback(async () => {
    const newFrom = commentsLengthRef.current; // Ref 사용
    const newTo = newFrom + 4;
    await fetchComments(newFrom, newTo, true);
  }, [fetchComments]);

  // ✅ 무한 스크롤 감시자 (Throttling 로직 포함)
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];

      // Ref를 사용하여 최신 hasMore 값 접근
      if (
        target.isIntersecting &&
        hasMoreRef.current &&
        !throttleTimer.current
      ) {
        handleLoadMore();

        throttleTimer.current = setTimeout(() => {
          throttleTimer.current = null;
        }, 500);
      }
    },
    [handleLoadMore]
  );

  // 4. [useEffect #4] 옵저버 등록 및 클린업 (최초 1회 실행)
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 1.0,
    });
    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) observer.observe(currentLoaderRef);

    return () => {
      if (currentLoaderRef) observer.unobserve(currentLoaderRef);
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, [handleObserver]);

  // 댓글 등록
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.warning("댓글 내용을 입력하세요.");
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        toast.error("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const { data: newCommentData, error } = await supabase
        .from("comment")
        .insert({
          content: newComment.trim(),
          topic_id: topicId,
          user_id: authData.user.id,
        })
        .select("*")
        .single();

      if (error) {
        toast.error("댓글 등록 실패");
      } else if (newCommentData) {
        setNewComment("");
        toast.success("댓글이 등록되었습니다.");

        setComments((prev) => [
          {
            ...newCommentData,
            email: authData.user?.email || "Anonymous",
          } as Comment,
          ...prev,
        ]);
      }
    } catch (err) {
      toast.error("알 수 없는 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Enter 처리
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId: number) => {
    const { error } = await supabase
      .from("comment")
      .delete()
      .eq("id", commentId);
    if (error) {
      toast.error("댓글 삭제 실패");
    } else {
      toast.success("해당 댓글을 삭제하였습니다.");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto mt-6">
      <div className="flex gap-2 pl-3 mb-4">
        <MessageSquareMore className="size-8" />
        <div className="flex font-semibold text-lg  text-neutral-400 mt-1 gap-1">
          <p>댓글</p> <p className="font-bold text-white">{comments.length}</p>
          개
        </div>
      </div>
      {/* 댓글 입력 */}
      <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl shadow-lg mb-5">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글을 입력해주세요... ✨"
          className="min-h-[90px] bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />

        <div className="flex justify-end items-center mt-3">
          <Button
            onClick={handleAddComment}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md hover:shadow-emerald-500/30 transition"
          >
            {loading ? "등록중..." : "등록"}
          </Button>
        </div>
      </div>
      <Separator />

      {/* 댓글 리스트 */}
      <div className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <p className="text-zinc-600 text-center">
            등록된 댓글이 없습니다. 🚀
          </p>
        ) : (
          comments.map((c) => {
            const isOwner = c.user_id === currentUserId;
            return (
              <article
                key={c.id}
                // ⭐️ [수정] 트렌디한 배경 및 테두리 효과 적용 ⭐️
                className={`p-4 rounded-xl transition-all shadow-lg 
                ${
                  isOwner
                    ? "bg-zinc-900 border border-transparent ring-1 ring-zinc-400/80 hover:ring-zinc-200/70 " // 소유자: 은은한 에메랄드 링
                    : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700" // 일반: 부드러운 징크 테두리
                } 
                hover:shadow-xl hover:shadow-zinc-900/50`}
              >
                <header className="flex justify-between items-center mb-3">
                  <div className="flex gap-3 items-center">
                    <CircleUserRound
                      className={`size-6 ${
                        isOwner ? "text-zinc-100" : "text-zinc-400"
                      }`}
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-white flex items-center gap-2 mb-0.">
                        {c.email || "Anonymous"}
                        {isOwner && (
                          <span className="text-[10px] font-normal text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-700/50">
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
                      onConfirm={() => handleDelete(c.id)}
                      title="댓글을 삭제하시겠습니까?"
                      description="이 댓글을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠어요?"
                    />
                  )}
                </header>
                <p className="mt-3 text-zinc-100 leading-relaxed break-words whitespace-pre-wrap">
                  {c.content}
                </p>
              </article>
            );
          })
        )}
      </div>

      {/* 더보기 버튼 or 로더 */}
      {hasMore && (
        <div
          ref={loaderRef}
          className="flex justify-center py-6 text-sm text-emerald-400"
        >
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="bg-zinc-800 hover:bg-zinc-700 text-emerald-300 hover:text-white"
          >
            <p className="pl-2">더보기</p>
            <ChevronsDown />
          </Button>
        </div>
      )}
    </section>
  );
}
