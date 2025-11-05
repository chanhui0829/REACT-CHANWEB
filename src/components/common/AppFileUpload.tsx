import { useRef, useEffect, useState } from "react";
import type { DragEvent as ReactDragEvent } from "react";
import { Button, Input } from "../ui";
import { Image, Trash2 } from "lucide-react";

// ------------------------------
// 🔹 Props 타입 정의
// ------------------------------
interface Props {
  file: File | string | null;
  onChange: (file: File | string | null) => void;
}

// ------------------------------
// 🔹 AppFileUpload 컴포넌트
// ------------------------------
export function AppFileUpload({ file, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // ------------------------------
  // 🔹 파일 변경 시 상위 컴포넌트로 전달
  // ------------------------------
  const handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0] ?? null);
    event.target.value = ""; // 파일 입력 초기화
  };

  // ------------------------------
  // 🔹 드래그 앤 드롭 업로드 처리
  // ------------------------------
  const handleDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) onChange(droppedFile);
  };

  const handleDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  // ------------------------------
  // 🔹 메모리 누수 방지 (Blob URL revoke)
  // ------------------------------
  useEffect(() => {
    if (file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  // ------------------------------
  // 🔹 썸네일 미리보기 렌더링
  // ------------------------------
  const renderPreview = () => {
    // 이미지 URL(string)
    if (typeof file === "string") {
      return (
        <div className="relative group">
          <img
            src={file}
            alt="@THUMBNAIL"
            className="w-full aspect-video rounded-lg object-cover border border-zinc-700"
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      );
    }

    // 이미지 파일(File)
    if (file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      return (
        <div className="relative group">
          <img
            src={objectUrl}
            alt="@THUMBNAIL"
            className="w-full aspect-video rounded-lg object-cover border border-zinc-700"
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      );
    }

    // 기본 상태 (파일 없음)
    return (
      <div
        className={`w-full flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed 
          ${
            isDragOver
              ? "border-emerald-400 bg-emerald-950/20"
              : "border-zinc-700 bg-zinc-900"
          } 
          transition-colors duration-300 cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Image
          className={`w-8 h-8 mb-2 ${
            isDragOver ? "text-emerald-400" : "text-zinc-400"
          }`}
        />
        <p
          className={`text-sm ${
            isDragOver ? "text-emerald-300" : "text-zinc-500"
          }`}
        >
          {isDragOver
            ? "여기에 파일을 놓으세요"
            : "이미지를 클릭하거나 드래그하여 업로드"}
        </p>
      </div>
    );
  };

  // ------------------------------
  // 🔹 UI 렌더링
  // ------------------------------
  return (
    <div className="space-y-3">
      {renderPreview()}
      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleChangeFile}
        className="hidden"
      />
    </div>
  );
}
