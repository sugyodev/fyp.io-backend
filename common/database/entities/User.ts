import { Column, Entity, Index, PrimaryColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Profile } from './Profile';

@Entity()
export class User {
  /**
   * NOTE: Use SnowflakeService to generate IDs.
   */
  @PrimaryColumn({ type: "bigint" })
  id: string;

  @Column({ type: "varchar", length: 128 })
  @Index({ unique: true })
  email: string;

  @Column({ type: "varchar", length: 256, nullable: true })
  passwordHash: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  totpSecret: string;

  // The TOTP timestamp is stored in Redis, not in the database.
}
