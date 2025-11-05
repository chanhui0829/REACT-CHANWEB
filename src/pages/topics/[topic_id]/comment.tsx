import { useState, useEffect, useRef, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { CircleUserRound, MessageSquareMore, ChevronsDown } from "lucide-react";
import { toast } from "sonner";

import supabase from "@/lib/supabase";
import { Separator, Textarea, Button } from "@/components/ui";
import { AppDeleteDialog } from "@/components/common";

// --------------------------------------
// 🔹 타입 정의
// --------------------------------------
interface Comment {
  id: number;
  content: string;
  created_at: string;
  topic_id: number;
  user_id: string;
  email?: string | null;
}

// --------------------------------------
// 🔹 댓글 컴포넌트
// --------------------------------------
export default function CommentBox({ topicId }: { topicId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 페이지네이션 관리
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Ref 상태 추적 (무한 스크롤, throttle)
  const commentsLengthRef = useRef(0);
  const hasMoreRef = useRef(true);
  const throttleTimer = useRef<NodeJS.Timeout | null>(null);

  // --------------------------------------
  // ✅ 댓글 조회 (useCallback으로 메모이징)
  // --------------------------------------
  const fetchComments = useCallback(
    async (from = 0, to = 5, append = false) => {
      try {
        const { data, error } = await supabase
          .from("comment_user_view")
          .select("*")
          .eq("topic_id", topicId)
          .order("created_at", { ascending: true })
          .range(from, to);

        if (error) throw error;

        const requestedCount = to - from + 1;
        setHasMore(data.length === requestedCount);

        setComments((prev) => {
          const merged = append ? [...prev, ...data] : data;
          const unique = Array.from(
            new Map(merged.map((item) => [item.id, item])).values()
          );
          return unique;
        });
      } catch (err) {
        console.error("댓글 불러오기 실패:", err);
        toast.error("댓글을 불러오지 못했습니다.");
      }
    },
    [topicId]
  );

  // --------------------------------------
  // ✅ 댓글 추가
  // --------------------------------------
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.warning("댓글 내용을 입력하세요.");
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      const { data, error } = await supabase
        .from("comment")
        .insert({
          content: newComment.trim(),
          topic_id: topicId,
          user_id: user.id,
        })
        .select("*")
        .single();

      if (error) throw error;

      toast.success("댓글이 등록되었습니다.");
      setNewComment("");
      setComments((prev) => [
        {
          ...data,
          email: user.email || "Anonymous",
        } as Comment,
        ...prev,
      ]);
    } catch (err) {
      console.error("댓글 등록 실패:", err);
      toast.error("댓글 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------
  // ✅ 댓글 삭제
  // --------------------------------------
  const handleDelete = async (commentId: number) => {
    try {
      const { error } = await supabase
        .from("comment")
        .delete()
        .eq("id", commentId);
      if (error) throw error;

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("댓글이 삭제되었습니다.");
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
      toast.error("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  // --------------------------------------
  // ✅ 키보드 이벤트 (Enter → 등록)
  // --------------------------------------
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // --------------------------------------
  // ✅ 무한 스크롤 감시자
  // --------------------------------------
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMoreRef.current && !throttleTimer.current) {
      handleLoadMore();

      throttleTimer.current = setTimeout(() => {
        throttleTimer.current = null;
      }, 500);
    }
  }, []);

  // --------------------------------------
  // ✅ "더보기" 핸들러
  // --------------------------------------
  const handleLoadMore = useCallback(async () => {
    const newFrom = commentsLengthRef.current;
    const newTo = newFrom + 4;
    await fetchComments(newFrom, newTo, true);
  }, [fetchComments]);

  // --------------------------------------
  // ✅ 로그인 유저 확인
  // --------------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setCurrentUserId(data.user.id);
    };
    fetchUser();
  }, []);

  // --------------------------------------
  // ✅ Ref 동기화
  // --------------------------------------
  useEffect(() => {
    commentsLengthRef.current = comments.length;
    hasMoreRef.current = hasMore;
  }, [comments, hasMore]);

  // --------------------------------------
  // ✅ 초기 로드
  // --------------------------------------
  useEffect(() => {
    fetchComments(0, 5, false);
    setHasMore(true);
  }, [topicId, fetchComments]);

  // --------------------------------------
  // ✅ 옵저버 등록 / 해제
  // --------------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 1.0,
    });
    const current = loaderRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
      if (throttleTimer.current) clearTimeout(throttleTimer.current);
    };
  }, [handleObserver]);

  // --------------------------------------
  // ✅ 렌더링
  // --------------------------------------
  return (
    <section className="w-full max-w-3xl mx-auto mt-6">
      {/* 타이틀 */}
      <div className="flex gap-2 pl-3 mb-4">
        <MessageSquareMore className="size-8 text-zinc-200 mt-0.5" />
        <div className="flex font-semibold text-lg text-neutral-400 mt-1 gap-1">
          <p>댓글</p>
          <p className="font-bold text-white">{comments.length}</p>개
        </div>
      </div>

      {/* 입력창 */}
      <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl shadow-lg mb-5">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글을 입력해주세요... ✨"
          className="min-h-[90px] bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-500 focus:outline-none"
        />

        <div className="flex justify-end mt-3">
          <Button
            onClick={handleAddComment}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg shadow-md hover:shadow-emerald-400/30 transition"
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
                className={`p-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-zinc-900/50
                ${
                  isOwner
                    ? "bg-zinc-900 border border-transparent ring-1 ring-zinc-500/40 hover:ring-zinc-300/60"
                    : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <header className="flex justify-between items-center mb-3">
                  <div className="flex gap-3 items-center">
                    <CircleUserRound
                      className={`size-6 ${
                        isOwner ? "text-zinc-400" : "text-zinc-400"
                      }`}
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-white flex items-center gap-1.5">
                        {c.email || "Anonymous"}
                        {isOwner && (
                          <span className="text-[10px] font-normal text-emerald-400 bg-emerald-900/30 px-2 rounded-full border border-emerald-700/50">
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
                      description="이 댓글을 삭제하면 복구할 수 없습니다."
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

      {/* 더보기 버튼 */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-6">
          <Button
            onClick={handleLoadMore}
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
