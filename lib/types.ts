export type LngLatItem = {
  long: number;
  lat: number;
};

export type MapPoint = {
  id: number;
  name: string;
  // Saved locations carry a slug to link back to their detail page;
  // draft/search markers don't, so it's optional.
  slug?: string;
  description?: string;
} & LngLatItem;

export type NominatimResult = {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
};
