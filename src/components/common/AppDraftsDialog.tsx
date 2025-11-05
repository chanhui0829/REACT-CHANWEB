import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { toast } from "sonner";

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

import { DialogClose } from "@radix-ui/react-dialog";
import { AppDeleteDialog } from "./AppDeleteDialog";
import { TOPIC_STATUS, type Topic } from "@/types/topic.type";

// ------------------------------
// 🔹 Props 타입 정의
// ------------------------------
interface Props {
  children: React.ReactNode;
}

// ------------------------------
// 🔹 AppDraftsDialog 컴포넌트
// ------------------------------
export function AppDraftsDialog({ children }: Props) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [drafts, setDrafts] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ------------------------------
  // 🔹 임시 저장 토픽 조회 (최적화)
  // ------------------------------
  const fetchDrafts = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("topic")
        .select("*")
        .eq("author", user.id)
        .eq("status", TOPIC_STATUS.TEMP)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error(error);
      toast.error("임시 저장 토픽을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // ------------------------------
  // 🔹 특정 draft 삭제
  // ------------------------------
  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("topic").delete().eq("id", id);
      if (error) throw error;

      // UI 갱신
      setDrafts((prev) => prev.filter((draft) => draft.id !== id));
      toast.success("임시 저장된 토픽이 삭제되었습니다.");
    } catch (error) {
      console.error(error);
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  // ------------------------------
  // 🔹 최초 렌더링 시 draft 목록 로드
  // ------------------------------
  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // ------------------------------
  // 🔹 렌더링
  // ------------------------------
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
            <p className="text-base text-emerald-500 -mr-[6px]">
              {drafts.length}
            </p>
            <p>건</p>
          </div>

          <Separator />

          {/* ✅ 리스트 영역 */}
          <div className="w-full h-80 flex flex-col items-center">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-60 text-muted-foreground/50">
                불러오는 중...
              </div>
            ) : drafts.length > 0 ? (
              <div className="w-full max-w-2xl mx-auto space-y-2 overflow-y-auto mt-3">
                {drafts.map((draft, index) => (
                  <div
                    key={draft.id}
                    className="w-full flex items-center py-2 px-4 gap-3 rounded-md bg-card/50 cursor-pointer hover:bg-card/70 transition"
                  >
                    <div
                      className="flex justify-between w-full items-start"
                      onClick={() => navigate(`/topics/${draft.id}/create`)}
                    >
                      <div className="flex w-full items-start gap-2 overflow-hidden">
                        <Badge className="w-5 h-5 mt-2 mr-3 rounded-sm aspect-square text-foreground bg-[#E26F24] hover:bg-[#E26F24]">
                          {index + 1}
                        </Badge>
                        <div className="flex flex-col w-[calc(100%-2rem)]">
                          <p className="line-clamp-1 break-all pr-4 font-medium">
                            {draft.title || "(제목 없음)"}
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

                    {/* 삭제 버튼 (확인 다이얼로그 포함) */}
                    <AppDeleteDialog
                      onConfirm={() => handleDelete(draft.id)}
                      title="정말 이 토픽을 삭제하시겠습니까?"
                      description="삭제된 토픽은 복구할 수 없습니다."
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="min-h-60 flex items-center justify-center">
                <p className="text-muted-foreground/50">
                  임시 저장된 토픽이 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="border-0">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
