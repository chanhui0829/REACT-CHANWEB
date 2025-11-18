import { useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Store & utils
import { useAuthStore } from '@/stores';
import supabase from '@/lib/supabase';

// UI components
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PasswordInput,
} from '@/components/ui';

// ------------------------------
// 🔹 Zod Schema
// ------------------------------
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$&*?!%])[A-Za-z\d!@$%&*?]{8,15}$/;

const formSchema = z.object({
  email: z.string().email('올바른 형식의 이메일 주소를 입력해주세요.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(passwordRegex, '영문, 숫자, 특수문자를 포함해야 합니다.'),
});

// ------------------------------
// 🔹 SignIn Component
// ------------------------------
export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  // 회원가입 후 redirect 시 자동 입력될 이메일
  const prefillEmail = location.state?.email || '';

  // Zustand user — setUser는 useAuthListener가 관리하므로 여기선 user만 조회
  const user = useAuthStore((state) => state.user);

  // ------------------------------
  // 🔹 react-hook-form
  // ------------------------------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: prefillEmail, password: '' },
  });

  // ------------------------------
  // 🔹 로그인 상태면 자동 redirect
  // ------------------------------
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // ------------------------------
  // 🔹 Google 로그인
  // ------------------------------
  const handleGoogleSignIn = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { access_type: 'offline', prompt: 'consent' },
        redirectTo: `${import.meta.env.VITE_SUPABASE_BASE_URL}/auth/callback`,
      },
    });

    if (error) toast.error(error.message);
  }, []);

  // ------------------------------
  // 🔹 일반 로그인 (email/password)
  // ------------------------------
  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data.session) {
          toast.success('로그인이 성공하였습니다.');
          navigate('/');
        }
      } catch (err) {
        console.error(err);
        toast.error('로그인 처리 중 오류가 발생했습니다.');
      }
    },
    [navigate]
  );

  // ------------------------------
  // 🔹 UI (절대 수정 X)
  // ------------------------------
  return (
    <main className="w-full h-full min-h-[720px] flex items-center justify-center p-6 gap-6">
      <div className="w-full max-w-[400px] flex flex-col px-6 gap-6">
        {/* 헤더 */}
        <header className="flex flex-col">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">로그인</h4>
          <p className="text-muted-foreground">로그인을 위한 정보를 입력해주세요.</p>
        </header>

        <section className="grid gap-3">
          {/* 소셜 로그인 */}
          <Button type="button" variant="secondary" onClick={handleGoogleSignIn}>
            <img
              src="/assets/icons/icon-003.png"
              alt="@GOOGLE-LOGO"
              className="w-[18px] h-[18px] mr-1"
            />
            구글 로그인
          </Button>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-muted-foreground bg-black uppercase">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* 로그인 폼 */}
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

              {/* 버튼 영역 */}
              <div className="flex flex-col gap-3">
                <Button type="submit" variant="outline" className="flex-1 !bg-sky-800/50">
                  로그인
                </Button>

                <div className="text-center text-sm">
                  계정이 없으신가요?
                  <NavLink to="/sign-up" className="underline ml-1">
                    회원가입
                  </NavLink>
                </div>
              </div>
            </form>
          </Form>
        </section>
      </div>
    </main>
  );
}
