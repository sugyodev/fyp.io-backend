import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  ManyToOne,
} from "typeorm";
import { DataInterestCategory } from './DataInterestCategory';

@Entity()
export class DataInterestItem {
  /**
   * NOTE: Use SnowflakeService to generate IDs.
   */
  @PrimaryColumn({ type: "bigint" })
  id: string;

  @Column({ type: "varchar", length: 32 })
  @Index({ unique: true })
  name: string;

  @Column({ type: "varchar", length: 32 })
  description: string;

  @ManyToOne(() => DataInterestCategory, (dataInterestCategory) => dataInterestCategory.items)
  category: DataInterestCategory;
}
