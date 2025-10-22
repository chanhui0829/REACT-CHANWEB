import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuthStore } from "@/stores";
import { nanoid } from "nanoid";
import supabase from "@/lib/supabase";

import { AppEditor, AppFileUpload } from "@/components/common";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { TOPIC_CATEGORY } from "@/constants/category.constant";
import {
  ArrowLeft,
  Asterisk,
  BookOpenCheck,
  ImageOff,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import type { Block } from "@blocknote/core";
import { TOPIC_STATUS } from "@/types/topic.type";

export default function CreateTopic() {
  const user = useAuthStore((state) => state.user);

  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<Block[]>([]);
  const [category, setCategory] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<File | string | null>(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
    fetchTopic();
  }, []);

  const fetchTopic = async () => {
    try {
      const { data: topic, error } = await supabase
        .from("topic")
        .select("*")
        .eq("id", id);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (topic) {
        setTitle(topic[0].title);
        setContent(JSON.parse(topic[0].content));
        setCategory(topic[0].category);
        setThumbnail(topic[0].thumbnail);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!title && !content && !category && !thumbnail) {
      toast.warning("제목, 본문, 카테고리, 썸네일을 기입하세요.");
      return;
    }

    // 1. 파일 업로드 시, Supabase의 Storage 즉, bucket 폴더에 이미지를 먼저 업로드 한 후
    // 이미지가 저장된 bucket 폴더의 경로 URL 주소를 우리가 관리하고 있는 Topic 테이블 thumbnail 컬럼에 문자열 형태
    // 즉, string 타입 (DB에서는 Text 타입)으로 저장한다.

    let thumbnailUrl: string | null = null;

    if (thumbnail && thumbnail instanceof File) {
      // 썸네일 이미지를 storage에 업로드
      const fileExt = thumbnail.name.split(".").pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `topics/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, thumbnail);

      if (uploadError) throw uploadError;

      // 업로드된 이미지의 Public URL 값 가져오기
      const { data } = supabase.storage.from("files").getPublicUrl(filePath);

      if (!data) throw new Error("썸네일 Public URL 조회를 실패하였습니다.");
      thumbnailUrl = data.publicUrl;
    } else if (typeof thumbnail === "string") {
      // 기존 이미지 유지
      thumbnailUrl = thumbnail;
    }

    const { data, error } = await supabase
      .from("topic")
      .update([
        {
          title,
          content: JSON.stringify(content),
          category,
          thumbnail: thumbnailUrl,
          author: user?.id,
          status: TOPIC_STATUS.TEMP,
        },
      ])
      .eq("id", id)
      .select();

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      toast.success("작성 중인 토픽을 저장하였습니다.");
      return;
    }
  };

  const handlePublish = async () => {
    console.log(title, content, category, thumbnail);
    if (!(title && content && category && thumbnail)) {
      toast.warning("제목, 본문, 카테고리, 썸네일을 모두 기입하세요.");
      return;
    }

    // 1. 파일 업로드 시, Supabase의 Storage 즉, bucket 폴더에 이미지를 먼저 업로드 한 후
    // 이미지가 저장된 bucket 폴더의 경로 URL 주소를 우리가 관리하고 있는 Topic 테이블 thumbnail 컬럼에 문자열 형태
    // 즉, string 타입 (DB에서는 Text 타입)으로 저장한다.
    let thumbnailUrl: string | null = null;

    if (thumbnail && thumbnail instanceof File) {
      // 썸네일 이미지를 storage에 업로드
      const fileExt = thumbnail.name.split(".").pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `topics/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, thumbnail);

      if (uploadError) throw uploadError;

      // 업로드된 이미지의 Public URL 값 가져오기
      const { data } = supabase.storage.from("files").getPublicUrl(filePath);

      if (!data) throw new Error("썸네일 Public URL 조회를 실패하였습니다.");
      thumbnailUrl = data.publicUrl;
    } else if (typeof thumbnail === "string") {
      // 기존 이미지 유지
      thumbnailUrl = thumbnail;
    }

    const { data, error } = await supabase
      .from("topic")
      .update([
        {
          title,
          content: JSON.stringify(content),
          category,
          thumbnail: thumbnailUrl,
          author: user?.id,
          status: TOPIC_STATUS.PUBLISH,
        },
      ])
      .eq("id", id)
      .select();

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      toast.success("토픽을 발행하였습니다.");
      navigate("/");

      return;
    }
  };

  return (
    <main className="w-full h-full min-h-[1024px] flex gap-6 p-6">
      <div className="fixed right-1/2 bottom-10 translate-x-1/2 z-20 flex items-center gap-2">
        <Button variant={"outline"} size={"icon"} onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <Button
          type="button"
          variant={"outline"}
          className="w-22 !bg-yellow-800/50"
          onClick={handleSave}
        >
          <Save />
          저장
        </Button>
        <Button
          type="button"
          variant={"outline"}
          className="w-22 !bg-emerald-800/50"
          onClick={handlePublish}
        >
          <BookOpenCheck />
          발행
        </Button>
      </div>
      {/* 토픽 작성하기 */}
      <section className="w-3/4 h-full flex flex-col gap-6">
        <div className="flex flex-col pb-6 border-b">
          <span className="text-[#F96859] font-semibold">Step 01</span>
          <span className="text-base font-semibold">토픽 작성하기</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">제목</Label>
          </div>
          <Input
            placeholder="토픽 제목을 입력하세요."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-16 pl-6 !text-lg placeholder:text-lg placeholder:font-semibold border-0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">본문</Label>
          </div>
          {/* BlockNote Text Editor UI */}
          <AppEditor props={content} setContent={setContent} />
        </div>
      </section>
      {/* 카테고리 및 썸네일 등록 */}
      <section className="w-1/4 h-full flex flex-col gap-6">
        <div className="flex flex-col pb-6 border-b">
          <span className="text-[#F96859] font-semibold">Step 02</span>
          <span className="text-base font-semibold">
            카테고리 및 썸네일 등록
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">카테고리</Label>
          </div>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="토픽(주제) 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>카테고리(주제)</SelectLabel>
                {TOPIC_CATEGORY.map((item) => {
                  return (
                    <SelectItem key={item.id} value={item.category}>
                      {item.label}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">썸네일</Label>
          </div>
          {/* 썸네일 UI */}
          <AppFileUpload file={thumbnail} onChange={setThumbnail} />
          <Button
            variant={"outline"}
            className="border-0"
            onClick={() => setThumbnail(null)}
          >
            <ImageOff />
            썸네일 제거
          </Button>
        </div>
      </section>
    </main>
  );
}
