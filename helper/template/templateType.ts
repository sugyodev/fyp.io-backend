import { TemplateTypes, BackgroundTypes, ButtonStyles } from './templateEnum';
export interface ITemplate {
  coverState: boolean;
  carouselImageUrls: string[];
  backgroundUrl: string | null;
  
  status: boolean;
  templateType: TemplateTypes;
  backgroundType: BackgroundTypes;

  gradientColor1: string | null;
  gradientColor2: string | null;

  backColor: string;
  buttonColor: string;
  fontColor: string;
  iconColor: string;

  buttonStyle: ButtonStyles;
  fontId: number;
  transparencyId: number;
}