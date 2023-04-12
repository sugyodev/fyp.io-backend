import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Profile } from "./Profile";

@Entity()
export class ReferralPremium {
    /**
     * NOTE: Use SnowflakeService to generate IDs.
     */
    @PrimaryColumn({ type: "bigint" })
    id: string;

    @Column({ type: "varchar" })
    socialUrl: string;

    @Column({ type: "int", nullable: true })
    followers: number | null;

    @Column({ type: "varchar" })
    status: string;

    @Column({ type: "bigint", nullable: true })
    startPremiumAt: number;

    @Column({ type: "bigint", nullable: true })
    endPremiumAt: number | null;

    @OneToOne(() => User)
    @JoinColumn()
    owner: User;

    @OneToOne(() => Profile)
    @JoinColumn()
    profile: Profile;
}
