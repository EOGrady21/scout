export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  created_by: string;
  created_at: string;
  condition_count?: number;
  latest_rating?: number | null;
}

export interface Condition {
  id: string;
  location_id: string;
  user_id: string;
  condition_date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  description: string;
  photo_url: string | null;
  created_at: string;
  user_name?: string | null;
  user_image?: string | null;
}

export interface LocationWithConditions extends Location {
  conditions: Condition[];
}

export type RatingLabel = {
  [key: number]: string;
};

export const RATING_LABELS: RatingLabel = {
  1: "Terrible",
  2: "Poor",
  3: "Fair",
  4: "Good",
  5: "Excellent",
};
