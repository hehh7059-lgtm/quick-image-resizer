
export interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  unit: 'px' | 'percent';
  percentage: number;
  quality: number;
}

export interface ImageData {
  originalUrl: string;
  name: string;
  type: string;
  width: number;
  height: number;
  size: number; // Size in bytes
}
