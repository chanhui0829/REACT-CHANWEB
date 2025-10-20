import { toast } from "sonner";
import { Skeleton } from "../ui";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import type { Topic } from "@/types/topic.type";
import { CircleUser } from "lucide-react";
import { useNavigate } from "react-router";

interface Props {
  props: Topic;
}

async function findUserById(id: string) {
  try {
    const { data: user, error } = await supabase
      .from("user")
      .select("*")
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    //닉네임 받기 구글 시 분기처리 고려
    if (user && user.length > 0) {
      return user[0].email.split("@")[0] + "님";
    } else {
      return "알 수 없는 사용자";
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function NewTopicCard({ props }: Props) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState<string>("");
  useEffect(() => {
    async function fetchAuthEmail() {
      const email = await findUserById(props.author);
      setNickname(email || "알 수 없는 사용자");
    }
    fetchAuthEmail();
  }, []);

  return (
    <div
      className="relative w-1/5 min-w-58 flex flex-col gap-2 cursor-pointer"
      onClick={() => navigate(`/topics/${props.id}/detail`)}
    >
      <Skeleton className="w-full h-64 bg-transparent">
        <div className="relative w-full h-full bg-cover">
          <img
            src={props.thumbnail}
            alt="@THUMBNAIL"
            className="w-full h-full aspect-square rounded-lg
            object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
            <div className="absolute bottom-0 p-4">
              <h3 className="text-white font-bold text-xl line-clamp-2">
                {props.title}
              </h3>
            </div>
          </div>
        </div>
      </Skeleton>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-full bg-transparent ">
            <div className="w-100px flex flex-row gap-2">
              <CircleUser style={{ width: 18 + "px" }} />
              <p className="font-semibold mt-[2px]">{nickname}</p>
            </div>
            <div>
              <p className="w-32 h-5 bg-transparent  text-muted-foreground">
                {props.category}
              </p>
            </div>
          </Skeleton>
        </div>
      </div>
    </div>
  );
}

export { NewTopicCard };
