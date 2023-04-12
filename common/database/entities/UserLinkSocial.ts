import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
} from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class UserLinkSocial {
  /**
   * NOTE: Use SnowflakeService to generate IDs.
   */
  @PrimaryColumn({ type: "bigint" })
  id: string;

  @Column({ type: "int" })
  socialLinkId: number;

  @Column({ type: "varchar", length: 32, nullable: true })
  url: string | null;

  @ManyToOne(() => Profile, (profile) => profile.socialPinnedLinks)
  profile: Profile;
}
