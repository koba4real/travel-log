export type LngLatItem = {
  lng: number;
  lat: number;
};

export type MapPoint = {
  id: number;
  name: string;
  description?: string;
} & LngLatItem;

export type NominatimResult = {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
};
