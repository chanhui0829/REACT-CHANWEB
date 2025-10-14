import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuthStore } from "@/stores";
import supabase from "@/lib/supabase";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Separator,
} from "@/components/ui";
import { ArrowLeft, Asterisk, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const formSchema = z
  .object({
    email: z.email({
      error: "올바른 형식의 이메일 주소를 입력해주세요.",
    }),
    password: z.string().min(8, {
      error: "비밀번호는 최소 8자 이상이어야 합니다.",
    }),
    confirmPassword: z.string().min(8, {
      error: "비밀번호 확인을 입력해주세요.",
    }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "비밀번호가 일치하지 않습니다.",
        path: ["confirmPassword"],
      });
    }
  });

export default function SignUp() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [serviceAgreed, setServiceAgreed] = useState<boolean>(false); // 서비스 이용약관 동의 여부
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false); // 개인정보 수집 및 이용약관 동의 여부
  const [marketingAgreed, setMarketingAgreed] = useState<boolean>(false); // 마케팅 및 광고 수신약관 동의 여부

  const handleCheckService = () => setServiceAgreed(!serviceAgreed);
  const handleCheckPrivacy = () => setPrivacyAgreed(!privacyAgreed);
  const handleCheckMarketing = () => setMarketingAgreed(!marketingAgreed);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email as string,
          role: session.user.role as string,
        });
        navigate("/");
      }
    };
    checkSession();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("회원가입 버튼 클릭!");

    if (!serviceAgreed || !privacyAgreed) {
      // 경고 메시지 - Toast UI 발생
      toast.warning("필수 동의항목을 체크해주세요.");
      return;
    }

    try {
      const {
        data: { user, session },
        error,
      } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      // 회원가입 실패
      if (error) {
        // 에러 메시지 - Toast UI 발생
        toast.error(error.message);
        return;
      }

      // SignUp.js의 onSubmit 함수 내에서 (트리거를 사용하지 않는 경우)
      if (user && session) {
        // ⚠️ DB 트리거를 사용하지 않을 경우에만 이 업데이트 로직을 사용해야 합니다.
        const { error: updateError } = await supabase
          .from("user")
          .update({
            service_agreed: serviceAgreed,
            privacy_agreed: privacyAgreed,
            marketing_agreed: marketingAgreed,
          })
          .eq("id", user.id);

        if (updateError) {
          toast.error("약관 동의 정보 저장 중 오류가 발생했습니다.");
        }

        toast.success("회원가입을 완료하였습니다.");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      throw new Error(`${error}`);
    }
  };

  return (
    <main className="w-full h-full min-h-[720px] flex items-center justify-center p-6 gap-6">
      <div className="w-100 max-w-100 flex flex-col px-6 gap-6">
        <div className="flex flex-col">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            회원가입
          </h4>
          <p className="text-muted-foreground">
            회원가입을 위한 정보를 입력해주세요.
          </p>
        </div>
        <div className="grid gap-3">
          {/* 회원가입 폼 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input placeholder="이메일을 입력하세요." {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="비밀번호를 입력하세요."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="비밀번호 확인을 입력하세요."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="grid gap-2">
                <div className="grid gap-2">
                  <div className="flex items-center gap-1">
                    <Asterisk size={14} className="text-[#F96859]" />
                    <Label>필수 동의항목</Label>
                  </div>
                  <div className="flex flex-col">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          className="w-[18px] h-[18px]"
                          checked={serviceAgreed}
                          onCheckedChange={handleCheckService}
                        />
                        서비스 이용약관 동의
                      </div>
                      <Button variant={"link"} className="!p-0 gap-1">
                        <p className="text-xs">자세히 보기</p>
                        <ChevronRight className="mt-[2px]" />
                      </Button>
                    </div>
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          className="w-[18px] h-[18px]"
                          checked={privacyAgreed}
                          onCheckedChange={handleCheckPrivacy}
                        />
                        개인정보 수집 및 이용동의
                      </div>
                      <Button variant={"link"} className="!p-0 gap-1">
                        <p className="text-xs">자세히 보기</p>
                        <ChevronRight className="mt-[2px]" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label>선택 동의항목</Label>
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        className="w-[18px] h-[18px]"
                        checked={marketingAgreed}
                        onCheckedChange={handleCheckMarketing}
                      />
                      마케팅 및 광고 수신 동의
                    </div>
                    <Button variant={"link"} className="!p-0 gap-1">
                      <p className="text-xs">자세히 보기</p>
                      <ChevronRight className="mt-[2px]" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Button type="button" variant={"outline"} size={"icon"}>
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="submit"
                    variant={"outline"}
                    className="flex-1 !bg-sky-800/50"
                  >
                    회원가입
                  </Button>
                </div>
                <div className="text-center">
                  이미 계정이 있으신가요?
                  <NavLink to={"/sign-in"} className="underline ml-1">
                    로그인
                  </NavLink>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
