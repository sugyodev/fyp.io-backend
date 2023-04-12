import { Column, Entity, Index, PrimaryColumn } from "typeorm";
import { Profile } from './Profile';

import { TemplateTypes, BackgroundTypes, ButtonStyles } from '../../../helper/template/templateEnum';

@Entity()
export class UserTemplate {
  /**
   * NOTE: Use SnowflakeService to generate IDs.
   */
  @PrimaryColumn({ type: "bigint" })
  id: string;

  @Column({ type: "boolean", default: false })
  coverState: boolean;
  @Column({ type: 'text', default: [], array: true })
  carouselImageUrls: string[] | null;
  @Column({ type: "varchar", length: "96", nullable: true })
  backgroundUrl: string | null;

  @Column({ type: "boolean", default: false })
  status: boolean;

  @Column({ type: "enum", enum: TemplateTypes, default: TemplateTypes.MINIMAL })
  templateType: TemplateTypes;
  @Column({ type: "enum", enum: BackgroundTypes, default: BackgroundTypes.SOLID_COLOR })
  backgroundType: BackgroundTypes;

  @Column({ type: "varchar", length: "32", nullable: true })
  gradientColor1: string | null;
  @Column({ type: "varchar", length: "32", nullable: true })
  gradientColor2: string | null;
  @Column({ type: "varchar", length: "32", nullable: true })
  backColor: string | null;
  @Column({ type: "varchar", length: "32", nullable: true })
  buttonColor: string | null;
  @Column({ type: "varchar", length: "32", nullable: true })
  fontColor: string | null;
  @Column({ type: "varchar", length: "32", nullable: true })
  iconColor: string | null;

  @Column({ type: "enum", enum: ButtonStyles, default: ButtonStyles.FILL_1 })
  buttonStyle: ButtonStyles;
  @Column({ type: "int", default: 0 })
  fontId: number;
  @Column({ type: "int", default: 0 })
  transparencyId: number;
}