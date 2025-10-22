import React from "react";
import { Trash2 } from "lucide-react";

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
} from "@/components/ui"; // ⭐️ 상대 경로 수정

interface DeleteConfirmDialogProps {
  // 다이얼로그를 여는 버튼 등의 React 요소
  trigger?: React.ReactNode;
  // 삭제 버튼 클릭 시 실행할 함수
  onConfirm: () => void;
  // 다이얼로그의 제목
  title?: string;
  // 다이얼로그의 설명
  description?: string;
  // 삭제 버튼에 표시될 텍스트
  confirmText?: string;
  // 취소 버튼에 표시될 텍스트
  cancelText?: string;
}

//기본값 세팅 + props
export function AppDeleteDialog({
  trigger,
  onConfirm,
  title = "정말 삭제하시겠습니까?",
  description = "삭제하시면 모든 내용이 영구적으로 삭제되어 복구할 수 없습니다.",
  confirmText = "삭제",
  cancelText = "닫기",
}: DeleteConfirmDialogProps) {
  const defaultTrigger = (
    <Button
      size="icon"
      className="text-white bg-red-500/80 hover:bg-red-400/80"
      title="삭제"
    >
      <Trash2 className="size-4" />
    </Button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ? trigger : defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-xl font-bold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-zinc-800 border-zinc-700 text-zinc-300">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            // ⭐️ onConfirm 함수는 여기에 연결합니다.
            onClick={onConfirm}
            // 다크 모드에 맞춘 트렌디한 삭제 버튼 스타일
            className="bg-red-600 text-white hover:bg-red-700 font-semibold shadow-md shadow-red-700/30 transition-all duration-200"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
