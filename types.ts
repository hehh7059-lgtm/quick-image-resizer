
export interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  unit: 'px' | 'percent';
  percentage: number;
}

export interface ImageData {
  originalUrl: string;
  name: string;
  type: string;
  width: number;
  height: number;
}
