export type LngLatItem = {
  lng: number;
  lat: number;
};

export type MapPoint = {
  id: number;
  label: string;
} & LngLatItem;
