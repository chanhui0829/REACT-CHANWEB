import { useRef } from "react";
import { Button, Input } from "../ui";
import { Image } from "lucide-react";

interface Props {
  file: File | string | null;
  onChange: (file: File | string | null) => void;
}

export function AppFileUpload({ file, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  //1. 파일 변 감지 및 상위 컴포넌트 전달
  const handleChageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0] ?? null);

    //이벤트 타겟 밸류 초기화
    event.target.value = "";
  };
  //이미지 미리보기
  const handleRenderPreview = () => {
    if (typeof file === "string") {
      return (
        <img
          src={file}
          alt="@THUMBNAIL"
          className="w-full aspect-video rounded-lg object-cover border"
        />
      );
    } else if (file instanceof File) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="@THUMBNAIL"
          className="w-full aspect-video rounded-lg object-cover border"
        />
      );
    }
    //썸네일이 설정되지 않은 경우에는 기본 이미지 아이콘을 보여준다.
    return (
      <div className="w-full flex items-center justify-center aspect-video bg-card rounded-lg">
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image />
        </Button>
      </div>
    );
  };
  return (
    <>
      {handleRenderPreview()}
      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleChageFile}
        className="hidden"
      />
    </>
  );
}
