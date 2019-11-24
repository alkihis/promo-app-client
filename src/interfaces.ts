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
  jobs?: Job[];
  internships?: Internship[];
  last_update: string; // Date
}
export type PartialStudent = {
  jobs?: PartialJob[];
  internships?: PartialInternship[];
} | Student;

export const FormationLevels = {
  licence: "Licence",
  master: "Master",
  phd: "Doctorat",
  other: "Autre",
};
export type FormationLevel = keyof typeof FormationLevels;
export interface Formation {
  id: number;
  branch: string;
  level: FormationLevel;
  location: string;
}

export interface Internship {
  id: number;
  during: string;
  owner: Student | number;
  domain: Domain;
  company: Company;
  referrer?: Contact;
}
export type PartialInternship = Internship | {
  company: number;
};

export interface Job {
  id: number;
  owner: Student | number;
  company: Company;
  referrer?: Contact;
  domain: Domain;
  from: string;
  to: string | null;
  type: JobType;
  wage: number;
  level: JobLevel;
}
export type PartialJob = Job | {
  company: number;
};

export const Domains: { [domain: string]: string } = {
  other: "Autre",
};
export type Domain = string;
export interface FullDomain {
  domain: string;
  name: string;
  id: number;
}

export const JobTypes = {
  cdi: "CDI", 
  cdd: "CDD", 
  alternance: "Alternance",
  these: "Thèse",
};
export type JobType = keyof typeof JobTypes;

export const JobLevels = {
  technicien: "Technicien", 
  ingenieur: "Ingénieur", 
  doctorant: "Doctorant",
  alternant: "Alternant",
};
export type JobLevel = keyof typeof JobLevels;

export interface Contact {
  id: number;
  name: string;
  email: string;
  linked_to: number;
}
export interface FullContact {
  id: number;
  name: string;
  email: string;
  linked_to: Company;
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
  medium: "Moyenne (jusqu'à 250 salariés)",
  big: "Grande (jusqu'à 1000 salariés)",
  very_big: "Très grande (au delà)"
};
export type CompanySize = keyof typeof CompanySizes;

export const CompanyStatuses = {
  public: "Public", 
  private: "Privé"
};
export type CompanyStatus = keyof typeof CompanyStatuses;
