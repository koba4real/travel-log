export type LngLatItem = {
  lng: number;
  lat: number;
};

export type MapPoint = {
  id: number;
  name: string;
  description?: string;
} & LngLatItem;
