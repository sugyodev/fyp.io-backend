export interface setCategoriesDto {
  categories: number[];
}

export interface getLinkInfoDto {
  linkname: string;
}

export interface setAccountDto {
  username: string;
  description: string;
  avatarUrl: string;
  phoneNumber: string;
}

export interface setTemplateDto {
  templateId?: number;
  coverState?: boolean;
  carouselImageUrls?: string[];
  custom?: TemplateCustomDto;
}

export interface TemplateCustomDto {
  status?: boolean;
  type?: number;

  backgroundImageUrl?: string | null;
  backgroundVideoUrl?: string | null;
  gradientColor1?: string | null;
  gradientColor2?: string | null;
  coverImageUrl?: string | null;

  backColor?: string;
  btnBackColor?: string;
  fontColor?: string;
  iconColor?: string;

  btnStyle?: string;
  fontId?: number;
  transparencyId?: number;
}