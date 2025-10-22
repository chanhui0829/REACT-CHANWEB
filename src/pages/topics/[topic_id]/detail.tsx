import { AppDeleteDialog, AppEditor } from "@/components/common";
import { Button, Separator } from "@/components/ui";
import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import CommentBox from "./comment";

export default function TopicDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const rawId = params.id; // string | undefined

  // id가 없거나 숫자로 변환 불가하면 처리
  const topicId = rawId ? Number(rawId) : NaN;
  useEffect(() => {
    if (!rawId) {
      // 필요한 경우 redirect 또는 에러 처리
      console.error("Invalid topic id");
    }
  }, [rawId]);

  const user = useAuthStore((state) => state.user);

  const [author, setAuthor] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<string>("");

  const fetchTopic = async () => {
    try {
      const { data: topic, error } = await supabase
        .from("topic")
        .select("*")
        .eq("id", topicId);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (topic) {
        console.log(topic);
        setAuthor(topic[0].author);
        setTitle(topic[0].title);
        setContent(topic[0].content);
        setCategory(topic[0].category);
        setThumbnail(topic[0].thumbnail);
      }
    } catch (error) {
      console.log(error);
      throw error;
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
    fetchTopic();
  }, [topicId]);

  return (
    <main className="w-full h-full min-h-[720px] flex flex-col">
      <div
        className="relative w-full h-60 md:h-100 bg-cover bg-[50%_35%] bg-accent"
        style={{ backgroundImage: `url(${thumbnail})` }}
      >
        {/* 뒤로 가기 */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 mt-5">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          {/* 토픽을 작성한 사람의 user_id와 로그인한 사람의 user_id가 같은 경우에만 보이도록 설정. */}
          {author === user?.id && (
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
        <span className="mb-4">{category}</span>
        <h1 className="scroll-m-20 text-center font-extrabold tracking-tigh text-xl sm:text-2xl md:text-4xl">
          {title}
        </h1>
        <Separator className="!w-6 my-6 bg-foreground" />
        <span>2025.10.06</span>
      </section>
      {/* 에디터 내용을 블러와 렌더링 */}
      <div className="w-full py-10">
        {content && <AppEditor props={JSON.parse(content)} readonly />}
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
