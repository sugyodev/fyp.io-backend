import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";

import { User } from "./User";
import { UserTemplate } from './UserTemplate';
import { UserLinkSocial } from './UserLinkSocial';
import { UserLinkCustom } from './UserLinkCustom';
import { UserLinkEmbed } from './UserLinkEmbed';
import { UserAccount } from './UserAccount';
import { DataInterestCategory } from './DataInterestCategory';

@Entity()
export class Profile {
  /**
   * NOTE: Use SnowflakeService to generate IDs.
   */
  @PrimaryColumn({ type: "bigint" })
  id: string;


  @Column({ type: "varchar", length: 32 })
  @Index({ unique: true })
  linkname: string;

  //for get user
  @OneToOne(() => User)
  @JoinColumn()
  owner: User;

  @OneToOne(() => UserAccount)
  @JoinColumn()
  account: UserAccount;

  //for claimed interest
  //-db relation interest
  @ManyToMany(() => DataInterestCategory)
  @JoinTable()
  interestCategories: DataInterestCategory[];

  //-non-db relation interest
  @Column({ type: "simple-array", nullable: true })
  categories: number[]


  //for selected template
  @OneToOne(() => UserTemplate)
  @JoinColumn()
  template: UserTemplate;

  //for pinned social links on link page
  @OneToMany(() => UserLinkSocial, (userLinkSocial) => userLinkSocial.profile)
  socialPinnedLinks: UserLinkSocial[];

  //for custom links on link page
  @OneToMany(() => UserLinkCustom, (userLinkCustom) => userLinkCustom.profile)
  customLinks: UserLinkCustom[];

  //for embed links on Embed page
  @OneToMany(() => UserLinkEmbed, (userLinkEmbed) => userLinkEmbed.profile)
  embedLinks: UserLinkEmbed[];

}
