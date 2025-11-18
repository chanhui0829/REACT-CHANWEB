import { useEffect, useMemo } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { Block } from '@blocknote/core';
import { ko } from '@blocknote/core/locales';

import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';

// ------------------------------
// 🔹 Props 타입 정의
// ------------------------------
interface Props {
  value: Block[]; // 기존 props → value 로 변경
  onChange?: (content: Block[]) => void; // 기존 setContent → onChange 로 변경
  readonly?: boolean;
}

// ------------------------------
// 🔹 AppEditor 컴포넌트
// ------------------------------
export function AppEditor({ value, onChange, readonly = false }: Props) {
  const locale = useMemo(() => ko, []);

  const editor = useCreateBlockNote({
    dictionary: {
      ...locale,
      placeholders: {
        ...locale.placeholders,
        emptyDocument: "텍스트를 입력하거나 '/'를 눌러 명령어를 실행하세요.",
      },
    },
  });

  // 🔥 외부 value 변경되면 에디터와 동기화
  useEffect(() => {
    if (!value || value.length === 0) return;

    const current = JSON.stringify(editor.document);
    const next = JSON.stringify(value);

    if (current !== next) {
      editor.replaceBlocks(editor.document, value);
    }
  }, [value, editor]);

  return (
    <BlockNoteView
      editor={editor}
      editable={!readonly}
      onChange={() => {
        if (!readonly) {
          onChange?.(editor.document);
        }
      }}
      className={`
      rounded-lg  p-2 shadow-inner
      ${
        readonly
          ? 'border-0 bg-transparent !border-none'
          : 'bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600'
      }
    `}
    />
  );
}
