export interface Project {
  id: string;
  name: string;
  client: string;
  year: string;
  category: string;
  subCategory: string;
  shortDescription: string;
  fullDescription: string;
  challenge: string;
  solution: string;
  deliverables: string[];
  metrics: { label: string; value: string }[];
  technologies: string[];
  coverImage: string;
  videoUrl?: string;
  galleryImages: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
  featured?: boolean;
  accentColor?: string;
}

