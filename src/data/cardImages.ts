// Card Images Data for Birthday Cafe Card Flip View
// Set frontImageUrl and backImageUrl to "image" as requested.
// You can edit "image" with your image URL or relative path directly on GitHub!

export const BACK_SUMMER_IMAGE = "yuyeon_special/public/image/back_summer.png";

export interface CardItemData {
  id: number;
  title: string;
  orientation: 'vertical' | 'horizontal';
  frontImageUrl: string; // "image" -> Replace with your image path on GitHub
  backImageUrl: string;  // "image" -> Replace with your image path on GitHub
}

export const CARD_FLIP_ITEMS: CardItemData[] = [
  {
    id: 1,
    title: 'Summer Special #1',
    orientation: 'vertical',
    frontImageUrl: 'yuyeon_special/public/image/front1_summer.png',
    backImageUrl: BACK_SUMMER_IMAGE,
  },
  {
    id: 2,
    title: 'Summer Special #2',
    orientation: 'vertical',
    frontImageUrl: 'yuyeon_special/public/image/front2_summer.png',
    backImageUrl: BACK_SUMMER_IMAGE,
  },
  {
    id: 3,
    title: 'Summer Special #3',
    orientation: 'horizontal',
    frontImageUrl: 'yuyeon_special/public/image/front3_summer.png',
    backImageUrl: BACK_SUMMER_IMAGE,
  },
  {
    id: 4,
    title: 'Summer Special #4',
    orientation: 'horizontal',
    frontImageUrl: 'yuyeon_special/public/image/front4_summer.png',
    backImageUrl: BACK_SUMMER_IMAGE,
  },
  {
    id: 5,
    title: 'Summer Special #5',
    orientation: 'horizontal',
    frontImageUrl: 'yuyeon_special/public/image/front5_summer.png',
    backImageUrl: BACK_SUMMER_IMAGE,
  },
  {
    id: 6,
    title: 'Summer Special #6',
    orientation: 'horizontal',
    frontImageUrl: 'yuyeon_special/public/image/front_summer.png',
    backImageUrl: BACK_SUMMER_IMAGE,
  },
];
