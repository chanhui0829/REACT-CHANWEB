import { useCreateBlockNote } from "@blocknote/react";
// Or, you can use ariakit, shadcn, etc.
import { BlockNoteView } from "@blocknote/mantine";
import { ko } from "@blocknote/core/locales";
// Default styles for the mantine editor
import "@blocknote/mantine/style.css";
// Include the included Inter font
import "@blocknote/core/fonts/inter.css";
import type { Block } from "@blocknote/core";
import { useEffect } from "react";

interface Props {
  props: Block[];
  setContent?: (content: Block[]) => void;
  readonly?: boolean;
}

export function AppEditor({ props, setContent, readonly }: Props) {
  const locale = ko;

  // Create a new editor instance
  const editor = useCreateBlockNote({
    dictionary: {
      ...locale,
      placeholders: {
        ...locale.placeholders,
        emptyDocument: "텍스트를 입력하거나 '/'를 눌러 명령어를 실행하세요.",
      },
    },
  });

  useEffect(() => {
    if (props && props.length > 0) {
      const current = JSON.stringify(editor.document);
      const next = JSON.stringify(props);

      //current 값과 next 값이 같으면 교체를 안함
      if (current !== next) {
        editor.replaceBlocks(editor.document, props);
      }
    }
  }, [props, editor]);
  // Render the editor
  return (
    <BlockNoteView
      editor={editor}
      editable={!readonly}
      onChange={() => {
        if (!readonly) {
          setContent?.(editor.document);
        }
      }}
    />
  );
}
