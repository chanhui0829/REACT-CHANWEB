import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

import "./index.css";
import RootLayout from "./pages/layout.tsx"; //전역 레이아웃 컴포넌트
import App from "./pages"; //메인페이지
import SignUp from "./pages/sign-up"; //회원가입 페이지
import SignIn from "./pages/sign-in"; //로그인 페이지
import AuthCallback from "./pages/auth/callback.tsx"; //소셜 로그인 시, 콜백 페이지
import CreateTopic from "./pages/topics/[topic_id]/create.tsx"; //토픽 생성 페이지
import TopicDetail from "./pages/topics/[topic_id]/detail.tsx"; //토픽 상세 페이지

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<App />} />
            <Route path="sign-up" element={<SignUp />} />
            <Route path="sign-in" element={<SignIn />} />
            <Route path="auth/callback" element={<AuthCallback />} />
            <Route path="topics/:id/create" element={<CreateTopic />} />
            <Route path="topics/:id/detail" element={<TopicDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  </StrictMode>
);
