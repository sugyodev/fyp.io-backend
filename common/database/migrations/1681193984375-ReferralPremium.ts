import { MigrationInterface, QueryRunner } from "typeorm";

export class ReferralPremium1681193984375 implements MigrationInterface {
    name = 'ReferralPremium1681193984375'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referral_premium" ADD "profileId" bigint`);
        await queryRunner.query(`ALTER TABLE "referral_premium" ADD CONSTRAINT "UQ_bb3795ebdba82359fd545693c3f" UNIQUE ("profileId")`);
        await queryRunner.query(`ALTER TABLE "referral_premium" ADD CONSTRAINT "FK_bb3795ebdba82359fd545693c3f" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referral_premium" DROP CONSTRAINT "FK_bb3795ebdba82359fd545693c3f"`);
        await queryRunner.query(`ALTER TABLE "referral_premium" DROP CONSTRAINT "UQ_bb3795ebdba82359fd545693c3f"`);
        await queryRunner.query(`ALTER TABLE "referral_premium" DROP COLUMN "profileId"`);
    }

}
