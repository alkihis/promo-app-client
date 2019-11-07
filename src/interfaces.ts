export interface Student {
  id: number;
  last_name: string;
  first_name: string;
  year_in: string;
  year_out?: string;
  entered_in: "M1" | "M2";
  email: string;
  graduated: boolean;
  previous_formation: Formation | null;
  next_formation: Formation | null;
}

export interface Formation {
  id: number;
  name: string;
  location: string;
}
