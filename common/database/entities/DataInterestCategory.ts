import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  OneToMany,
} from "typeorm";
import { DataInterestItem } from './DataInterestItem';

@Entity()
export class DataInterestCategory {
  /**
   * NOTE: Use SnowflakeService to generate IDs.
   */
  @PrimaryColumn({ type: "bigint" })
  id: string;

  @Column({ type: "varchar", length: 32 })
  @Index({ unique: true })
  name: string;

  @Column({ type: "varchar", length: 90 })
  description: string;

  @OneToMany(() => DataInterestItem, (dataInterestItem) => dataInterestItem.category)
  items: DataInterestItem[];

}
