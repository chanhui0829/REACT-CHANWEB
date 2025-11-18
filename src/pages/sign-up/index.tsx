import { useEffect, useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Asterisk, ChevronRight } from 'lucide-react';

import { useAuthStore } from '@/stores';
import supabase from '@/lib/supabase';

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
  PasswordInput,
  Separator,
} from '@/components/ui';

// ------------------------------
// 🔹 Zod Schema
// ------------------------------
const formSchema = z
  .object({
    email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    confirmPassword: z.string().min(8, '비밀번호 확인을 입력해주세요.'),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: '비밀번호가 일치하지 않습니다.',
        path: ['confirmPassword'],
      });
    }
  });

// ------------------------------
// 🔹 SignUp Component
// ------------------------------
export default function SignUp() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user); // setUser 삭제됨: 필요 없음

  // --------------- form ---------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  // --------------- 약관 체크박스 ---------------
  const [serviceAgreed, setServiceAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  const handleCheckService = useCallback(() => setServiceAgreed((prev) => !prev), []);
  const handleCheckPrivacy = useCallback(() => setPrivacyAgreed((prev) => !prev), []);
  const handleCheckMarketing = useCallback(() => setMarketingAgreed((prev) => !prev), []);

  // ------------------------------
  // 🔹 로그인 상태면 홈으로 이동
  // ------------------------------
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // ------------------------------
  // 🔹 회원가입 처리
  // ------------------------------
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!serviceAgreed || !privacyAgreed) {
      toast.warning('필수 동의항목을 체크해주세요.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // 🔹 유저 테이블 업데이트 (약관 정보)
        const { error: updateError } = await supabase
          .from('user')
          .update({
            service_agreed: serviceAgreed,
            privacy_agreed: privacyAgreed,
            marketing_agreed: marketingAgreed,
          })
          .eq('id', data.user.id);

        if (updateError) {
          toast.error('약관 정보 저장 중 오류가 발생했습니다.');
        }

        // 🔹 signUp 후 자동 로그인되므로 명시적 로그아웃
        await supabase.auth.signOut();

        toast.success('회원가입이 완료되었습니다! 로그인해주세요.');
        navigate('/sign-in', { state: { email: values.email } });
      }
    } catch (err) {
      console.error(err);
      toast.error('회원가입 처리 중 오류가 발생했습니다.');
    }
  };

  // ------------------------------
  // 🔹 UI (절대 변경 X)
  // ------------------------------
  return (
    <main className="w-full h-full min-h-[720px] flex items-center justify-center p-6 gap-6">
      <div className="w-full max-w-[400px] flex flex-col px-6 gap-6">
        {/* 헤더 */}
        <header className="flex flex-col">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">회원가입</h4>
          <p className="text-muted-foreground">회원가입을 위한 정보를 입력해주세요.</p>
        </header>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 이메일 */}
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

            {/* 비밀번호 */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="비밀번호를 입력하세요." {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* 비밀번호 확인 */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 확인</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="비밀번호 확인을 입력하세요." {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* 약관 */}
            <section className="grid gap-2">
              {/* 필수 */}
              <div className="grid gap-2">
                <div className="flex items-center gap-1">
                  <Asterisk size={14} className="text-[#F96859]" />
                  <Label>필수 동의항목</Label>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={serviceAgreed}
                        onCheckedChange={handleCheckService}
                        className="w-[18px] h-[18px]"
                      />
                      서비스 이용약관 동의
                    </div>
                    <Button variant="link" className="!p-0 gap-1">
                      <p className="text-xs">자세히 보기</p>
                      <ChevronRight className="mt-[2px]" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={privacyAgreed}
                        onCheckedChange={handleCheckPrivacy}
                        className="w-[18px] h-[18px]"
                      />
                      개인정보 수집 및 이용동의
                    </div>
                    <Button variant="link" className="!p-0 gap-1">
                      <p className="text-xs">자세히 보기</p>
                      <ChevronRight className="mt-[2px]" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 선택 */}
              <div className="grid gap-2">
                <Label>선택 동의항목</Label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={marketingAgreed}
                      onCheckedChange={handleCheckMarketing}
                      className="w-[18px] h-[18px]"
                    />
                    마케팅 및 광고 수신 동의
                  </div>
                  <Button variant="link" className="!p-0 gap-1">
                    <p className="text-xs">자세히 보기</p>
                    <ChevronRight className="mt-[2px]" />
                  </Button>
                </div>
              </div>
            </section>

            {/* 버튼 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon">
                  <ArrowLeft />
                </Button>
                <Button type="submit" variant="outline" className="flex-1 !bg-sky-800/50">
                  회원가입
                </Button>
              </div>

              <div className="text-center text-sm">
                이미 계정이 있으신가요?
                <NavLink to="/sign-in" className="underline ml-1">
                  로그인
                </NavLink>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
}
