import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

// UI & Icons
import { Card, Separator } from "../ui";
import { CaseSensitive, Eye, Heart } from "lucide-react";

// types & utils
import type { Topic } from "@/types/topic.type";
import supabase from "@/lib/supabase";

dayjs.extend(relativeTime);
dayjs.locale("ko"); // 한국어 설정

// ------------------------------
// 🔹 텍스트 파싱 함수 (본문 추출)
// ------------------------------
function extractTextFromContent(content: string | [], maxChars = 200) {
  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    if (!Array.isArray(parsed)) {
      console.warn("content 데이터 타입이 배열이 아닙니다.");
      return "";
    }

    let result = "";

    for (const block of parsed) {
      if (Array.isArray(block.content)) {
        for (const child of block.content) {
          if (child?.text) {
            result += child.text + " ";
            if (result.length >= maxChars)
              return result.slice(0, maxChars) + "...";
          }
        }
      }
    }
    return result.trim();
  } catch (err) {
    console.error("콘텐츠 파싱 실패:", err);
    return "";
  }
}

// ------------------------------
// 🔹 유저 닉네임 조회 함수
// ------------------------------
async function findUserById(id: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("user")
      .select("email")
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return "알 수 없는 사용자";
    }

    if (data && data.length > 0) {
      // 구글 로그인 시 닉네임 부분만 표시
      return data[0].email.split("@")[0] + "님";
    }

    return "알 수 없는 사용자";
  } catch (err) {
    console.error(err);
    return "알 수 없는 사용자";
  }
}

// ------------------------------
// 🔹 TopicCard 컴포넌트
// ------------------------------
interface Props {
  props: Topic;
}

export function TopicCard({ props }: Props) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState<string>("");

  // ✅ 닉네임 불러오기
  const fetchNickname = useCallback(async () => {
    const name = await findUserById(props.author);
    setNickname(name);
  }, [props.author]);

  useEffect(() => {
    fetchNickname();
  }, [fetchNickname]);

  // ------------------------------
  // 🔹 UI 렌더링
  // ------------------------------
  return (
    <Card
      className="w-full h-fit p-4 gap-4 cursor-pointer hover:scale-[1.01] transition-all duration-200"
      onClick={() => navigate(`/topics/${props.id}/detail`)}
    >
      {/* 상단: 제목 + 썸네일 */}
      <div className="flex items-start gap-4">
        <div className="flex-1 flex flex-col items-start gap-4">
          <h3 className="h-16 text-base font-semibold tracking-tight line-clamp-2 flex flex-col items-start gap-2">
            <CaseSensitive
              size={16}
              className="text-muted-foreground mt-[3px]"
            />
            <span>{props.title}</span>
          </h3>
          <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
            {extractTextFromContent(props.content)}
          </p>
        </div>
        <img
          src={props.thumbnail}
          alt="@THUMBNAIL"
          className="w-[140px] h-[140px] aspect-square rounded-lg object-cover"
        />
      </div>

      <Separator />

      {/* 하단: 작성자 + 카테고리 + 조회수/좋아요/작성일 */}
      <div className="w-full flex justify-between items-start text-sm">
        <div className="flex flex-col text-gray-400">
          <p className="font-semibold text-white mb-0.5">{nickname}</p>
          <p className="text-gray-500 text-xs">{props.category}</p>
        </div>

        <div className="flex flex-col items-end text-white">
          <div className="flex gap-2 text-xs mb-1">
            <p className="flex items-center gap-1">
              <Eye size={14} className="text-gray-400" />
              <span>{props.views}</span>
            </p>
            <Separator orientation="vertical" className="!h-4" />
            <p className="flex items-center gap-1">
              <Heart color="#ef4444" fill="#ef4444" size={14} />
              <span>{props.likes}</span>
            </p>
          </div>
          <p className="text-xs text-gray-400">
            {dayjs(props.created_at).fromNow()}
          </p>
        </div>
      </div>
    </Card>
  );
}
