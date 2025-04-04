
export interface HeroContent {
  id: string;
  page: string;
  title: string;
  subtitle: string;
  primary_button_text?: string | null;
  primary_button_link?: string | null;
  secondary_button_text?: string | null;
  secondary_button_link?: string | null;
  background_image?: string | null;
  created_at: string;
  updated_at: string;
}
