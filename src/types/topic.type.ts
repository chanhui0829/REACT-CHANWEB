export enum TOPIC_STATUS {
  TEMP = "temp",
  PUBLISH = "publish",
}

export interface Topic {
  id: number;
  created_at: Date | string;
  author: any; // 변경 예정
  title: string;
  content: string;
  category: string;
  thumbnail: string;
  status: TOPIC_STATUS;
}
