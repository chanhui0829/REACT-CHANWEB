import { memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

import { useQuery } from '@tanstack/react-query';

// UI & Icons
import { Card, Separator } from '../ui';
import { CaseSensitive, Eye, Heart } from 'lucide-react';

// types & utils
import type { Topic } from '@/types/topic.type';
import supabase from '@/lib/supabase';

dayjs.extend(relativeTime);
dayjs.locale('ko');

// ------------------------------
// 🔹 텍스트 파싱 함수
// ------------------------------
function extractTextFromContent(content: string | [], maxChars = 200) {
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    if (!Array.isArray(parsed)) return '';

    let result = '';
    for (const block of parsed) {
      if (Array.isArray(block.content)) {
        for (const child of block.content) {
          if (child?.text) {
            result += child.text + ' ';
            if (result.length >= maxChars) return result.slice(0, maxChars) + '...';
          }
        }
      }
    }
    return result.trim();
  } catch {
    return '';
  }
}

// ------------------------------
// 🔹 유저 닉네임 조회
// ------------------------------
async function findUserById(id: string): Promise<string> {
  try {
    const { data, error } = await supabase.from('user').select('email').eq('id', id);

    if (error) return '알 수 없는 사용자';
    if (!data || data.length === 0) return '알 수 없는 사용자';

    return data[0].email.split('@')[0] + '님';
  } catch {
    return '알 수 없는 사용자';
  }
}

// ------------------------------
// 🔹 TopicCard 컴포넌트
// ------------------------------
interface Props {
  props: Topic;
}

function TopicCardComponent({ props }: Props) {
  const navigate = useNavigate();

  const handleNavigate = useCallback(() => {
    navigate(`/topics/${props.id}/detail`);
  }, [navigate, props.id]);

  const previewText = useMemo(() => extractTextFromContent(props.content), [props.content]);

  // 🔥 닉네임 Query
  const { data: nickname = '' } = useQuery({
    queryKey: ['user', props.author],
    queryFn: () => findUserById(props.author),
    staleTime: Infinity,
  });

  // 🔥 좋아요 개수 Query
  const { data: likesData = [] } = useQuery({
    queryKey: ['topicLikes', props.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topic_likes')
        .select('user_id')
        .eq('topic_id', props.id);

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5000,
  });

  const likesCount = likesData.length;

  return (
    <Card
      className="w-full h-fit p-4 gap-4 cursor-pointer hover:scale-[1.01] transition-all duration-200"
      onClick={handleNavigate}
    >
      {/* 상단 */}
      <div className="flex items-start gap-4">
        <div className="flex-1 flex flex-col items-start gap-4">
          <h3 className="h-16 text-base font-semibold tracking-tight line-clamp-2 flex flex-col items-start gap-2">
            <CaseSensitive size={16} className="text-muted-foreground mt-[3px]" />
            <span>{props.title}</span>
          </h3>
          <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
            {previewText}
          </p>
        </div>
        <img
          src={props.thumbnail ?? '/assets/default-thumbnail.png'}
          alt="@THUMBNAIL"
          className="w-[140px] h-[140px] aspect-square rounded-lg object-cover"
        />
      </div>

      <Separator />

      {/* 하단 */}
      <div className="w-full flex justify-between items-start text-sm">
        <div className="flex flex-col text-gray-400">
          <p className="font-semibold text-white mb-0.5">{nickname}</p>
          <p className="text-gray-500 text-xs">{props.category}</p>
        </div>

        <div className="flex flex-col items-end text-white">
          <div className="flex gap-2 text-xs mb-1">
            <p className="flex items-center gap-1">
              <Eye size={14} className="text-gray-400" />
              <span>{props.views}</span>
            </p>
            <Separator orientation="vertical" className="!h-4" />
            <p className="flex items-center gap-1">
              <Heart color="#ef4444" fill="#ef4444" size={14} />
              <span>{likesCount}</span>
            </p>
          </div>
          <p className="text-xs text-gray-400">{dayjs(props.created_at).fromNow()}</p>
        </div>
      </div>
    </Card>
  );
}

export const TopicCard = memo(TopicCardComponent);
