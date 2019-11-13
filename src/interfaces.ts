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
  branch: string;
  level: "licence" | "master" | "doctorat" | "other";
  location: string;
}

export interface Internship {
  id: number;
  during: string;
  owner: Student | number;
  company: Company;
  referrer?: Contact;
}

export interface Job {
  id: number;
  owner: Student | number;
  company: Company;
  referrer?: Contact;
  domain: Domain;
  from: string;
  to: string;
  type: JobType;
  wage: number;
  level: JobLevel;
}

export const Domains = {
  "r_d": "Recherche et développement",
  "other": "Autre",
};
export type Domain = keyof typeof Domains;

export const JobTypes = {
  cdi: "CDI", 
  cdd: "CDD", 
  alternance: "Alternance",
  these: "Thèse", // TODO!
};
export type JobType = keyof typeof JobTypes;

export const JobLevels = {
  technicien: "Technicien", 
  ingenieur: "Ingénieur", // TODO !
};
export type JobLevel = keyof typeof JobLevels;

export interface Contact {
  id: number;
  name: string;
  email: string;
  linked_to: number;
}

export interface Company {
  id: number;
  name: string;
  town: string;
  size: CompanySize;
  status: CompanyStatus;
}

export const CompanySizes = {
  small: "Petite (jusqu'à 30 salariés)",
  medium: "Moyenne (jusqu'à 150 salariés)",
  big: "Grande (jusqu'à 1000 salariés)",
  very_big: "Très grande (au delà)"
};
export type CompanySize = keyof typeof CompanySizes;

export const CompanyStatuses = {
  public: "Public", 
  private: "Privé"
};
export type CompanyStatus = keyof typeof CompanyStatuses;
