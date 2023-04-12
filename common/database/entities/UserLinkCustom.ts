import { Entity, Column, PrimaryColumn, ManyToOne, Timestamp } from "typeorm";
import { Profile } from "./Profile";

import {
	LinkStyle,
	LinkImageType,
	LinkPrioritize,
	LinkLockType,
	LinkClockType,
	LinkType,
} from "../../Define";

@Entity()
export class UserLinkCustom {
	/**
	 * NOTE: Use SnowflakeService to generate IDs.
	 */
	@PrimaryColumn({ type: "bigint" })
	id: string;

	@Column({ type: "enum", enum: LinkType, default: LinkType.Custom })
	type: LinkType;

	@Column({ type: "varchar", length: 32, nullable: true })
	title: string | null;

	@Column({ type: "varchar", length: 90, nullable: true })
	url: string | null;

	@Column({ type: "boolean", default: true })
	enabled: boolean;

	@Column({ type: "bigint", default: 0 })
	clickCnt: number;

	@Column({ type: "enum", enum: LinkStyle, default: LinkStyle.TextOnly })
	linkStyle: LinkStyle;

	@Column({ type: "enum", enum: LinkImageType, default: LinkImageType.File })
	imageType: LinkImageType;

	@Column({ type: "varchar", nullable: true })
	imageUrl: string | null;

	@Column({
		type: "enum",
		enum: LinkPrioritize,
		default: LinkPrioritize.Animations,
	})
	prioritizeType: LinkPrioritize;

	@Column({ type: "int", default: 0 })
	prioritizeId: number;

	@Column({ type: "enum", enum: LinkLockType, default: LinkLockType.None })
	lockType: LinkLockType;

	@Column({ type: "boolean", default: false })
	lockEnabled: boolean;

	@Column({ type: "varchar", length: 32, nullable: true })
	lockCode: string | null;

	@Column({ type: "varchar", length: 32, nullable: true })
	lockAge: number | null;

	@Column({ type: "varchar", length: 64, nullable: true })
	lockDescription: string | null;

	@Column({ type: "enum", enum: LinkClockType, default: LinkClockType.None })
	clockType: LinkClockType;

	@Column({ type: "boolean", default: false })
	clockEnabled: boolean;

	@Column({ type: "timestamp", nullable: true })
	clockStamp1: Timestamp | null;

	@Column({ type: "timestamp", nullable: true })
	clockStamp2: Timestamp | null;

	@Column({ type: "varchar", length: 32, nullable: true })
	clockZone1: string | null;

	@Column({ type: "varchar", length: 32, nullable: true })
	clockZone2: string | null;

	@ManyToOne(() => Profile, (profile) => profile.customLinks)
	profile: Profile;
}
