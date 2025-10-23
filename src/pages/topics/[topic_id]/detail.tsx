import { AppDeleteDialog, AppEditor } from "@/components/common";
import { Button, Separator } from "@/components/ui";
import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { ArrowLeft, Eye, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import CommentBox from "./comment";
import type { Topic } from "@/types/topic.type";

export default function TopicDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const topicId = Number(id);
  const user = useAuthStore((state) => state.user);

  const [topic, setTopic] = useState<Topic>();
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // 🔹 토픽 불러오기
  const fetchTopic = async () => {
    const { data, error } = await supabase
      .from("topic")
      .select("*")
      .eq("id", topicId)
      .single();

    if (error) return toast.error(error.message);
    setTopic(data);
  };

  // 🔹 조회수 +1
  const increaseViews = async () => {
    await supabase.rpc("increment_topic_views", { topic_id: topicId });
  };

  // 🔹 좋아요 여부 확인
  const checkIfLiked = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("topic_likes")
      .select("*")
      .eq("topic_id", topicId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) console.error(error);
    setIsLiked(!!data);
  };

  // 🔹 좋아요 개수 가져오기
  const fetchLikesCount = async () => {
    // ① 전체 좋아요 수 (topic.likes)
    const { data: topicData, error: topicError } = await supabase
      .from("topic")
      .select("likes")
      .eq("id", topicId)
      .single();

    if (topicError) console.error(topicError);
    else setLikesCount(topicData?.likes ?? 0);

    // ② 현재 로그인 유저가 이 토픽에 좋아요 했는지 확인
    const { data: likeData, error: likeError } = await supabase
      .from("topic_likes")
      .select("id")
      .eq("topic_id", topicId)
      .maybeSingle(); // maybeSingle: 없을 경우 null 반환

    if (likeError) console.error(likeError);
    else setIsLiked(!!likeData);
  };

  // 🔹 좋아요 토글
  const toggleLike = async () => {
    if (!user) return toast.error("로그인이 필요합니다.");

    try {
      const { data, error } = await supabase.rpc("toggle_topic_like", {
        p_topic_id: topicId,
      });
      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        setIsLiked(Boolean(row.liked));
        setLikesCount(Number(row.like_count ?? 0));
      }
    } catch (err) {
      console.error(err);
      toast.error("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("topic").delete().eq("id", topicId);

      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("토픽을 삭제하였습니다.");
      navigate("/");
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  useEffect(() => {
    increaseViews();
    fetchTopic();
    fetchLikesCount();
    checkIfLiked();
  }, [topicId]);

  if (!topic) return <div>로딩중...</div>;

  return (
    <main className="w-full h-full min-h-[720px] flex flex-col">
      <div
        className="relative w-full h-60 md:h-100 bg-cover bg-[50%_35%] bg-accent"
        style={{ backgroundImage: `url(${topic.thumbnail})` }}
      >
        {/* 뒤로 가기 */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 mt-5">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          {/* 토픽을 작성한 사람의 user_id와 로그인한 사람의 user_id가 같은 경우에만 보이도록 설정. */}
          {topic.author === user?.id && (
            <AppDeleteDialog
              onConfirm={() => handleDelete()}
              title="정말 해당 토픽을 삭제하시겠습니까??"
              description="삭제하시면 해당 토픽의 모든 내용이 영구적으로 삭제되어 복구할 수 없습니다."
            />
          )}
        </div>
        {/* 좌,우,하단 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent "></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent "></div>
        <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a] via-transparent to-transparent "></div>
      </div>
      <section className="relative w-full flex flex-col items-center -mt-40">
        <span className="mb-4">{topic.category}</span>
        <h1 className="scroll-m-20 text-center font-extrabold tracking-tigh text-xl sm:text-2xl md:text-4xl">
          {topic.title}
        </h1>
        <Separator className="!w-6 my-6 bg-foreground" />
        <span>2025.10.06</span>
      </section>
      {/* 에디터 내용을 블러와 렌더링 */}
      <div className="w-full py-10">
        {topic.content && (
          <AppEditor props={JSON.parse(topic.content)} readonly />
        )}
      </div>
      <div className="p-4">
        <div className="flex gap-4 mt-4 items-center justify-end text-[16px] pr-6">
          {/* 👁 조회수 */}
          <div className="flex items-center gap-1.5 text-gray-200">
            <Eye size={24} />
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
      <div className="relative via-zinc-900 to-zinc-950">
        {/* 양옆 어두운 그라데이션 (시각적으로 좁아 보이게) */}
        <div className="absolute inset-y-0 left-0 w-[20vw] pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-[20vw] pointer-events-none" />

        {/* ⭐️ 수정된 부분: items-start 추가 */}
        <div className=" z-10 flex justify-center gap-3 px-0 py-8 items-start">
          {/* 댓글 본문 영역 */}
          <section className=" flex-1 max-w-4xl">
            <CommentBox topicId={topicId} />
          </section>

          {/* 오른쪽 사이드 영역 */}
          <aside className=" hidden lg:block w-[320px] mr-20 space-y-6 sticky top-20">
            {/* 인기 토픽 */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
              <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                🔥 인기 토픽
              </h3>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">
                  React vs Vue 논쟁
                </li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">
                  Supabase 인증 완전정복
                </li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">
                  Tailwind로 포트폴리오 만들기
                </li>
                <li className="hover:text-emerald-400 cursor-pointer transition-colors">
                  Next.js App Router 2025 패턴
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
