export type ActiveView = 'home' | 'summerflip' | 'miniroom' | 'visit' | 'minigame' | 'visit2026' | 'devnotes';

export interface GuestbookMessage {
  id?: string;
  page_id?: string;
  nickname: string;
  content: string;
  created_at: string;
}

export interface FlipCardItem {
  id: number;
  title: string;
  orientation: 'vertical' | 'horizontal';
  isFlipped: boolean;
  frontText?: string;
  backText?: string;
}
