import {
  Entity,
  Column,
  PrimaryColumn,
  Index
} from "typeorm";
import { BlackWordType } from '../../Define';

@Entity()
export class BlackWord {
  /**
   * NOTE: Use SnowflakeService to generate IDs.
   */
  @PrimaryColumn({ type: "bigint" })
  id: string;

  @Column({ type: "varchar", length: 32 })
  @Index({ unique: true })
  name: string;

  @Column({ type: "enum", enum: BlackWordType, default: BlackWordType.none })
  type: BlackWordType;

  // @Column({ type: "varchar", length: 32 })
  // typeChar: string;

  @Column({ type: "varchar", length: 90 })
  description: string;
}
