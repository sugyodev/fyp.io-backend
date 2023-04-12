import { Entity, Column, Index, PrimaryColumn } from "typeorm";

@Entity()
export class UserAccount {
	/**
	 * NOTE: Use SnowflakeService to generate IDs.
	 */
	@PrimaryColumn({ type: "bigint" })
	id: string;

	@Column({ type: "varchar", length: 32, nullable: true })
	username: string | null;

	@Column({ type: "varchar", length: 90, nullable: true })
	description: string | null;

	@Column({ type: "varchar", length: 90, nullable: true })
	avatarUrl: string | null;

	@Column({ type: "varchar", length: 32, nullable: true })
	phoneNumber: string | null;

	@Column({ type: "varchar", default: 32, nullable: true })
	timezone: string | null;
}
