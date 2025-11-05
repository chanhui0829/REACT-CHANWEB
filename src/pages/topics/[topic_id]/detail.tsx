import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import { toast } from "sonner";
import { ArrowLeft, Eye, Heart } from "lucide-react";

import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { AppDeleteDialog, AppEditor } from "@/components/common";
import { Button, Separator } from "@/components/ui";
import CommentBox from "./comment";
import type { Topic } from "@/types/topic.type";

export default function TopicDetail() {
  // --------------------------------------
  // ✅ 기본 상태 및 훅
  // --------------------------------------
  const { id } = useParams();
  const topicId = Number(id);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [topic, setTopic] = useState<Topic | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // --------------------------------------
  // ✅ 토픽 데이터 및 좋아요 정보 불러오기
  // --------------------------------------
  const fetchTopicData = useCallback(async () => {
    try {
      const [
        { data: topicData, error: topicError },
        { data: likeData, error: likeError },
      ] = await Promise.all([
        supabase.from("topic").select("*").eq("id", topicId).single(),
        supabase.from("topic_likes").select("user_id").eq("topic_id", topicId),
      ]);

      if (topicError) throw topicError;
      if (likeError) throw likeError;
      setTopic(topicData);
      setLikesCount(topicData?.likes ?? 0);

      // 로그인 유저가 좋아요 눌렀는지 여부 확인
      if (user && likeData) {
        setIsLiked(likeData.some((like) => like.user_id === user.id));
      }
    } catch (err) {
      console.error(err);
      toast.error("토픽 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [topicId, user]);

  // --------------------------------------
  // ✅ 좋아요 토글
  // --------------------------------------
  const toggleLike = useCallback(async () => {
    if (!user) return toast.error("로그인이 필요합니다.");

    try {
      const { data, error } = await supabase.rpc("toggle_topic_like", {
        p_topic_id: topicId,
      });
      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      setIsLiked(Boolean(row?.liked));
      setLikesCount(Number(row?.like_count ?? 0));
    } catch (err) {
      console.error(err);
      toast.error("좋아요 처리 중 오류가 발생했습니다.");
    }
  }, [topicId, user]);

  // --------------------------------------
  // ✅ 조회수 +1 증가 (RPC)
  // --------------------------------------
  const increaseViews = useCallback(async () => {
    try {
      await supabase.rpc("increment_topic_views", { topic_id: topicId });
    } catch (err) {
      console.error("조회수 증가 실패:", err);
    }
  }, [topicId]);

  // --------------------------------------
  // ✅ 토픽 삭제
  // --------------------------------------
  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("topic").delete().eq("id", topicId);
      if (error) throw error;

      toast.success("토픽이 삭제되었습니다.");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("토픽 삭제 중 오류가 발생했습니다.");
    }
  };

  // --------------------------------------
  // ✅ 초기 데이터 로드
  // --------------------------------------
  useEffect(() => {
    increaseViews();
    fetchTopicData();
  }, [topicId, fetchTopicData, increaseViews]);

  // --------------------------------------
  // ✅ 로딩 / 데이터 없음 처리
  // --------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px] text-zinc-400">
        토픽 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex justify-center items-center min-h-[500px] text-zinc-400">
        존재하지 않는 토픽입니다.
      </div>
    );
  }

  // --------------------------------------
  // ✅ 실제 렌더링 영역
  // --------------------------------------
  return (
    <main className="w-full min-h-[720px] flex flex-col">
      {/* 썸네일 영역 */}
      <div
        className="relative w-full h-60 md:h-100 bg-cover bg-[50%_35%] bg-accent"
        style={{ backgroundImage: `url(${topic.thumbnail})` }}
      >
        {/* 뒤로가기 + 삭제 */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 mt-5">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          {topic.author === user?.id && (
            <AppDeleteDialog
              onConfirm={handleDelete}
              title="정말 해당 토픽을 삭제하시겠습니까?"
              description="삭제 시 모든 내용이 영구적으로 삭제됩니다."
            />
          )}
        </div>

        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      {/* 🔹 제목 영역 */}
      <section className="relative w-full flex flex-col items-center -mt-40 text-center">
        <span className="mb-3 text-accent-foreground text-sm">
          {topic.category}
        </span>
        <h1 className="font-extrabold tracking-tight text-xl sm:text-2xl md:text-4xl">
          {topic.title}
        </h1>
        <Separator className="!w-6 my-6 bg-foreground" />
        <span className="text-sm text-zinc-500">
          {dayjs(topic.created_at).format("YYYY.MM.DD")}
        </span>
      </section>

      {/* 🔹 본문 (에디터) */}
      <div className="w-full py-10">
        {topic.content && (
          <AppEditor props={JSON.parse(topic.content)} readonly />
        )}
      </div>

      {/* 🔹 좋아요 + 조회수 */}
      <div className="p-4">
        <div className="flex gap-4 mt-4 items-center justify-end text-[16px] pr-6">
          {/* 👁 조회수 */}
          <div className="flex items-center gap-1.5 text-gray-200">
            <Eye size={22} />
            <span>{topic.views}</span>
          </div>
          {/* ❤️ 좋아요 */}
          <button
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              isLiked ? "text-red-500" : "text-gray-200"
            }`}
            onClick={toggleLike}
          >
            <Heart
              size={22}
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
            />
            <span>{likesCount}</span>
          </button>
        </div>
      </div>

      <Separator />

      {/* 🔹 댓글 + 사이드 섹션 */}
      <div className="relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="z-10 flex justify-center gap-3 px-0 py-8 items-start">
          {/* 댓글 */}
          <section className="flex-1 max-w-4xl">
            <CommentBox topicId={topicId} />
          </section>

          {/* 오른쪽 사이드바 */}
          <aside className="hidden lg:block w-[320px] mr-20 space-y-6 sticky top-20">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
              <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                🔥 인기 토픽
              </h3>
              <ul className="space-y-2 text-zinc-400 text-sm">
                {[
                  "React vs Vue 논쟁",
                  "Supabase 인증 완전정복",
                  "Tailwind로 포트폴리오 만들기",
                  "Next.js App Router 2025 패턴",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="hover:text-emerald-400 cursor-pointer transition-colors"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
