export interface MenuItem {
  label: string;
  icon: any;
  link?: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string; permission?: string[] }[];
  permission?: string[];
}
