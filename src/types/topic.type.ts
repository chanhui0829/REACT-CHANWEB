export enum TOPIC_STATUS {
  TEMP = 'temp',
  PUBLISH = 'publish',
}

export interface Topic {
  id: number;
  created_at: Date | string;
  author: string;
  title: string;
  content: string;
  category: string;
  thumbnail: string | null;
  status: TOPIC_STATUS;
  views: number;
  likes: number;
}
