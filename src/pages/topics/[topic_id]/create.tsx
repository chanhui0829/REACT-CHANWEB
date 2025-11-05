"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  ArrowLeft,
  Asterisk,
  BookOpenCheck,
  ImageOff,
  Save,
} from "lucide-react";

import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
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
import { TOPIC_STATUS } from "@/types/topic.type";
import type { Block } from "@blocknote/core";

export default function CreateTopic() {
  // --------------------------------------
  // ✅ 기본 상태 & 설정
  // --------------------------------------
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<Block[]>([]);
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState<File | string | null>(null);

  // --------------------------------------
  // ✅ 초기 데이터 불러오기
  // --------------------------------------
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetchTopic();
  }, []);

  const fetchTopic = async () => {
    try {
      const { data, error } = await supabase
        .from("topic")
        .select("*")
        .eq("id", id);

      if (error) throw error;
      if (!data?.length) return;

      const topic = data[0];
      setTitle(topic.title);
      setContent(JSON.parse(topic.content));
      setCategory(topic.category);
      setThumbnail(topic.thumbnail);
    } catch (err) {
      console.error(err);
      toast.error("토픽 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  // --------------------------------------
  // ✅ 썸네일 업로드 함수
  // --------------------------------------
  const uploadThumbnail = async (): Promise<string | null> => {
    if (!thumbnail) return null;

    // 새 파일 업로드
    if (thumbnail instanceof File) {
      const fileExt = thumbnail.name.split(".").pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `topics/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, thumbnail);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("files").getPublicUrl(filePath);
      if (!data) throw new Error("썸네일 URL 조회 실패");

      return data.publicUrl;
    }

    // 기존 URL 유지
    return typeof thumbnail === "string" ? thumbnail : null;
  };

  // --------------------------------------
  // ✅ 임시 저장 (TEMP 상태)
  // --------------------------------------
  const handleSave = async () => {
    if (!title || !content.length || !category || !thumbnail) {
      toast.warning("제목, 본문, 카테고리, 썸네일을 모두 기입하세요.");
      return;
    }

    try {
      const thumbnailUrl = await uploadThumbnail();
      const { error } = await supabase
        .from("topic")
        .update({
          title,
          content: JSON.stringify(content),
          category,
          thumbnail: thumbnailUrl,
          author: user?.id,
          status: TOPIC_STATUS.TEMP,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("작성 중인 토픽을 저장했습니다.");
    } catch (err) {
      console.error(err);
      toast.error("저장 중 오류가 발생했습니다.");
    }
  };

  // --------------------------------------
  // ✅ 토픽 발행 (PUBLISH 상태)
  // --------------------------------------
  const handlePublish = async () => {
    if (!title || !content.length || !category || !thumbnail) {
      toast.warning("제목, 본문, 카테고리, 썸네일을 모두 기입하세요.");
      return;
    }

    try {
      const thumbnailUrl = await uploadThumbnail();
      const { error } = await supabase
        .from("topic")
        .update({
          title,
          content: JSON.stringify(content),
          category,
          thumbnail: thumbnailUrl,
          author: user?.id,
          status: TOPIC_STATUS.PUBLISH,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("토픽을 발행했습니다.");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("발행 중 오류가 발생했습니다.");
    }
  };

  // --------------------------------------
  // ✅ 렌더링
  // --------------------------------------
  return (
    <main className="w-full min-h-[1024px] flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
      {/* Floating Buttons (저장/발행/뒤로가기) */}
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

      {/* Step 01: 토픽 작성 */}
      <section className="w-full lg:w-3/4 flex flex-col gap-6">
        <div className="flex flex-col pb-6 border-b">
          <span className="text-[#F96859] font-semibold">Step 01</span>
          <span className="text-base font-semibold">토픽 작성하기</span>
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">제목</Label>
          </div>
          <Input
            placeholder="토픽 제목을 입력하세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-16 pl-6 !text-lg placeholder:text-lg placeholder:font-semibold border-0"
          />
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">본문</Label>
          </div>
          <AppEditor props={content} setContent={setContent} />
        </div>
      </section>

      {/* Step 02: 카테고리 & 썸네일 */}
      <section className="w-full lg:w-1/4 flex flex-col gap-6">
        <div className="flex flex-col pb-6 border-b">
          <span className="text-[#F96859] font-semibold">Step 02</span>
          <span className="text-base font-semibold">
            카테고리 및 썸네일 등록
          </span>
        </div>

        {/* 카테고리 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">카테고리</Label>
          </div>
          <Select onValueChange={(value) => setCategory(value)}>
            <SelectTrigger className="w-full !bg-input/30">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>카테고리(주제)</SelectLabel>
                {TOPIC_CATEGORY.map((item) => (
                  <SelectItem key={item.id} value={item.category}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* 썸네일 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">썸네일</Label>
          </div>
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
