import type React from "react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import supabase from "@/lib/supabase";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Separator,
} from "@/components/ui";
import { toast } from "sonner";
import { DialogClose } from "@radix-ui/react-dialog";
import dayjs from "dayjs";

import { TOPIC_STATUS, type Topic } from "@/types/topic.type";
import { useNavigate } from "react-router";

import { AppDeleteDialog } from "./AppDeleteDialog";

interface Props {
  children: React.ReactNode;
}

export function AppDraftsDialog({ children }: Props) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<Topic[]>([]);

  const fetchDrafts = async () => {
    if (!user) return;
    try {
      const { data: topics, error } = await supabase
        .from("topic")
        .select("*")
        .eq("author", user.id)
        .eq("status", TOPIC_STATUS.TEMP);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (topics) setDrafts(topics);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ 특정 draft 삭제
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("topic").delete().eq("id", id);
    if (error) {
      toast.error("삭제 중 오류가 발생했습니다.");
      console.error(error);
    } else {
      setDrafts((prev) => prev.filter((draft) => draft.id !== id)); // UI에서 제거
      return;
    }
  };

  useEffect(() => {
    if (user) fetchDrafts();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>임시 저장된 토픽</DialogTitle>
          <DialogDescription>
            임시 저장된 토픽 목록입니다. 이어서 작성하거나 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div className="flex items-center gap-2">
            <p>임시 저장</p>
            <p className="text-base text-green-600 -mr-[6px]">
              {drafts.length}
            </p>
            <p>건</p>
          </div>
          <Separator />
          <div className="w-full h-80 flex flex-col items-center">
            {drafts.length > 0 ? (
              <div className="w-full max-w-2xl mx-auto space-y-2 overflow-scroll mt-3">
                {drafts.map((draft, index) => (
                  <div
                    key={draft.id}
                    className="w-full flex items-center py-2 px-4 gap-3 rounded-md bg-card/50 cursor-pointer hover:bg-card/70 transition "
                  >
                    <div
                      className="flex justify-between w-full items-start "
                      onClick={() => navigate(`/topics/${draft.id}/create`)}
                    >
                      <div className="flex w-full items-start gap-2 overflow-hidden">
                        <Badge className="w-5 h-5 mt-2 mr-3 rounded-sm aspect-square text-foreground bg-[#E26F24] hover:bg-[#E26F24]">
                          {index + 1}
                        </Badge>
                        <div className="flex flex-col w-[calc(100%-2rem)]">
                          <p className="line-clamp-1 break-all pr-4">
                            {draft.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            작성일:{" "}
                            {dayjs(draft.created_at).format("YYYY. MM. DD")}
                          </p>
                        </div>
                      </div>
                      <Badge className="mt-2" variant="outline">
                        작성중
                      </Badge>
                    </div>
                    <AppDeleteDialog
                      onConfirm={() => handleDelete(draft.id)}
                      title="정말 해당 작성중인 토픽을 삭제하시겠습니까?"
                      description="삭제하시면 해당 토픽의 모든 내용이 영구적으로 삭제되어 복구할 수 없습니다."
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="min-h-60 flex items-center justify-center">
                <p className="text-muted-foreground/50">
                  조회 가능한 정보가 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant={"outline"} className="border-0">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
