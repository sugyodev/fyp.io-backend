import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
} from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class UserLinkEmbed {
  /**
   * NOTE: Use SnowflakeService to generate IDs.
   */
  @PrimaryColumn({ type: "bigint" })
  id: string;

  @Column({ type: "varchar", length: 32 })
  type: string;

  @Column({ type: "varchar", length: 32 })
  url: string;

  @ManyToOne(() => Profile, (profile) => profile.embedLinks)
  profile: Profile;
}
