import { MigrationInterface, QueryRunner } from "typeorm";

export class kaikinChangeUserTemplateTable1679363632215 implements MigrationInterface {
    name = 'kaikinChangeUserTemplateTable1679363632215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_template" DROP COLUMN "btnStyle"`);
        await queryRunner.query(`DROP TYPE "public"."user_template_btnstyle_enum"`);
        await queryRunner.query(`ALTER TABLE "user_template" DROP COLUMN "backgroundImageUrl"`);
        await queryRunner.query(`ALTER TABLE "user_template" DROP COLUMN "btnBackColor"`);
        await queryRunner.query(`ALTER TABLE "user_template" ADD "backgroundUrl" character varying(96)`);
        await queryRunner.query(`ALTER TABLE "user_template" ADD "buttonColor" character varying(32)`);
        await queryRunner.query(`CREATE TYPE "public"."user_template_buttonstyle_enum" AS ENUM('fill_1', 'fill_2', 'fill_3', 'outLine_1', 'outLine_2', 'outLine_3', 'softShadow_1', 'softShadow_2', 'softShadow_3', 'hardShadow_1', 'hardShadow_2', 'hardShadow_3')`);
        await queryRunner.query(`ALTER TABLE "user_template" ADD "buttonStyle" "public"."user_template_buttonstyle_enum" NOT NULL DEFAULT 'fill_1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_template" DROP COLUMN "buttonStyle"`);
        await queryRunner.query(`DROP TYPE "public"."user_template_buttonstyle_enum"`);
        await queryRunner.query(`ALTER TABLE "user_template" DROP COLUMN "buttonColor"`);
        await queryRunner.query(`ALTER TABLE "user_template" DROP COLUMN "backgroundUrl"`);
        await queryRunner.query(`ALTER TABLE "user_template" ADD "btnBackColor" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "user_template" ADD "backgroundImageUrl" character varying(96)`);
        await queryRunner.query(`CREATE TYPE "public"."user_template_btnstyle_enum" AS ENUM('fill_1', 'fill_2', 'fill_3', 'outLine_1', 'outLine_2', 'outLine_3', 'softShadow_1', 'softShadow_2', 'softShadow_3', 'hardShadow_1', 'hardShadow_2', 'hardShadow_3')`);
        await queryRunner.query(`ALTER TABLE "user_template" ADD "btnStyle" "public"."user_template_btnstyle_enum" NOT NULL DEFAULT 'fill_1'`);
    }

}
