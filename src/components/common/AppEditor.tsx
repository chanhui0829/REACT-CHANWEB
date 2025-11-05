import { useEffect, useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block } from "@blocknote/core";
import { ko } from "@blocknote/core/locales";

import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

// ------------------------------
// 🔹 Props 타입 정의
// ------------------------------
interface Props {
  props: Block[];
  setContent?: (content: Block[]) => void;
  readonly?: boolean;
}

// ------------------------------
// 🔹 AppEditor 컴포넌트
// ------------------------------
export function AppEditor({ props, setContent, readonly = false }: Props) {
  // ✅ locale은 매 렌더링마다 다시 생성되지 않도록 useMemo로 감쌈
  const locale = useMemo(() => ko, []);

  // ✅ BlockNote 인스턴스 생성
  const editor = useCreateBlockNote({
    dictionary: {
      ...locale,
      placeholders: {
        ...locale.placeholders,
        emptyDocument: "텍스트를 입력하거나 '/'를 눌러 명령어를 실행하세요.",
      },
    },
  });

  // ✅ props(외부에서 받은 블록 데이터) 변경 시 동기화
  useEffect(() => {
    if (!props?.length) return;

    const current = JSON.stringify(editor.document);
    const next = JSON.stringify(props);

    // 불필요한 렌더 방지 — 내용이 같으면 교체 안 함
    if (current !== next) {
      editor.replaceBlocks(editor.document, props);
    }
  }, [props, editor]);

  // ✅ 에디터 렌더링
  return (
    <BlockNoteView
      editor={editor}
      editable={!readonly}
      onChange={() => {
        if (!readonly) {
          setContent?.(editor.document);
        }
      }}
      className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 shadow-inner"
    />
  );
}
