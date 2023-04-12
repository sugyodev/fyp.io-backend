import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Subscription {
	/**
	 * NOTE: Use SnowflakeService to generate IDs.
	 */
	@PrimaryColumn({ type: "bigint" })
	id: string;

	@Column({ type: "varchar", nullable: true })
	subscriptionId: string;

	@Column({ type: "varchar" })
	plan: string;

	@Column({ type: "varchar" })
	status: string;

	@Column({ type: "bigint", nullable: true })
	startSubscriptionAt: number;

	@Column({ type: "bigint", nullable: true })
	nextBillingAt: number | null;

	@Column({ type: "bigint", nullable: true })
	endSubscriptionAt: number | null;

	@OneToOne(() => User)
	@JoinColumn()
	owner: User;
}
