import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@/components/ui";

interface DeleteConfirmDialogProps {
  /** 다이얼로그를 여는 트리거 (버튼 등) */
  trigger?: React.ReactNode;
  /** 삭제 버튼 클릭 시 실행할 함수 */
  onConfirm: () => Promise<void> | void;
  /** 다이얼로그의 제목 */
  title?: string;
  /** 다이얼로그의 설명 */
  description?: string;
  /** 삭제 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
}

// ------------------------------
// 🔹 AppDeleteDialog 컴포넌트
// ------------------------------
export function AppDeleteDialog({
  trigger,
  onConfirm,
  title = "정말 삭제하시겠습니까?",
  description = "삭제하시면 모든 내용이 영구적으로 삭제되어 복구할 수 없습니다.",
  confirmText = "삭제",
  cancelText = "닫기",
}: DeleteConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 기본 트리거 버튼
  const defaultTrigger = (
    <Button
      size="icon"
      className="text-white bg-red-500/80 hover:bg-red-400/80"
      title="삭제"
    >
      <Trash2 className="size-4" />
    </Button>
  );

  // ✅ 삭제 실행 핸들러 (비동기 안전처리)
  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
    } catch (err) {
      console.error("삭제 처리 중 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? defaultTrigger}
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-lg font-semibold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            className="hover:bg-zinc-800 border-zinc-700 text-zinc-300 transition-all"
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isLoading}
            onClick={handleConfirm}
            className={`font-semibold transition-all duration-200 shadow-md shadow-red-700/30
              ${
                isLoading
                  ? "bg-red-400/50 text-white cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> 삭제 중...
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
