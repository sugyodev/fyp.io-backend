import { MigrationInterface, QueryRunner } from "typeorm";

export class kaikinChangedUserTemplateEntity1679362495018 implements MigrationInterface {
    name = 'kaikinChangedUserTemplateEntity1679362495018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d80b94dc62f7467403009d8806"`);
        await queryRunner.query(`CREATE TYPE "public"."black_word_type_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TABLE "black_word" ("id" bigint NOT NULL, "name" character varying(32) NOT NULL, "type" "public"."black_word_type_enum" NOT NULL DEFAULT '0', "description" character varying(90) NOT NULL, CONSTRAINT "PK_b3d67527577f4c76810c512ba34" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ffc8e90a74458730b9b7b00add" ON "black_word" ("name") `);
        await queryRunner.query(`CREATE TABLE "data_interest_item" ("id" bigint NOT NULL, "name" character varying(32) NOT NULL, "description" character varying(32) NOT NULL, "categoryId" bigint, CONSTRAINT "PK_99f422355b55a119cb49bdba95b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_43dbc1bad943aea885125c7cea" ON "data_interest_item" ("name") `);
        await queryRunner.query(`CREATE TABLE "data_interest_category" ("id" bigint NOT NULL, "name" character varying(32) NOT NULL, "description" character varying(90) NOT NULL, CONSTRAINT "PK_b8e4715fcbb35181896dafd7ea1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_26561961e7123bf25841ddccf8" ON "data_interest_category" ("name") `);
        await queryRunner.query(`CREATE TYPE "public"."user_template_templatetype_enum" AS ENUM('ONLYFANS', 'NEON', 'SNOW', 'THREE_DIMENSION_BTNS', 'MINE', 'MINIMAL', 'GLASS', 'BACKGROUND', 'PLANTS', 'PAINTED', 'WEB_TECH', 'MUSIC', 'MOONLIGHT', 'CYBER', 'HOROSCOPE')`);
        await queryRunner.query(`CREATE TYPE "public"."user_template_backgroundtype_enum" AS ENUM('SOLID_COLOR', 'BACKGOUND_PHOTO', 'BACKGROUND_VIDEO', 'GRADIENT', 'BACKGROUND_PHOTO')`);
        await queryRunner.query(`CREATE TYPE "public"."user_template_btnstyle_enum" AS ENUM('fill_1', 'fill_2', 'fill_3', 'outLine_1', 'outLine_2', 'outLine_3', 'softShadow_1', 'softShadow_2', 'softShadow_3', 'hardShadow_1', 'hardShadow_2', 'hardShadow_3')`);
        await queryRunner.query(`CREATE TABLE "user_template" ("id" bigint NOT NULL, "templateType" "public"."user_template_templatetype_enum" NOT NULL DEFAULT 'MINIMAL', "coverState" boolean NOT NULL DEFAULT false, "carouselImageUrls" text array NOT NULL DEFAULT '{}', "status" boolean NOT NULL DEFAULT false, "backgroundType" "public"."user_template_backgroundtype_enum" NOT NULL DEFAULT 'SOLID_COLOR', "backgroundImageUrl" character varying(96), "gradientColor1" character varying(32), "gradientColor2" character varying(32), "backColor" character varying(32), "btnBackColor" character varying(32), "fontColor" character varying(32), "iconColor" character varying(32), "btnStyle" "public"."user_template_btnstyle_enum" NOT NULL DEFAULT 'fill_1', "fontId" integer NOT NULL DEFAULT '0', "transparencyId" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_c922516f97f651f16e60de6e0db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_link_social" ("id" bigint NOT NULL, "socialLinkId" integer NOT NULL, "url" character varying(32), "profileId" bigint, CONSTRAINT "PK_a70c7d8c3654e06f6299e193c19" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_link_custom_type_enum" AS ENUM('Custom')`);
        await queryRunner.query(`CREATE TYPE "public"."user_link_custom_linkstyle_enum" AS ENUM('TextOnly', 'Thumbnail', 'Featured', 'ImageGrid', 'ImageWithText')`);
        await queryRunner.query(`CREATE TYPE "public"."user_link_custom_imagetype_enum" AS ENUM('GIF', 'File', 'ICON')`);
        await queryRunner.query(`CREATE TYPE "public"."user_link_custom_prioritizetype_enum" AS ENUM('None', 'Animations', 'SpotLight')`);
        await queryRunner.query(`CREATE TYPE "public"."user_link_custom_locktype_enum" AS ENUM('None', 'Code', 'Birthday', 'Mark')`);
        await queryRunner.query(`CREATE TYPE "public"."user_link_custom_clocktype_enum" AS ENUM('None', 'Schedule', 'CountDown', 'Redirect')`);
        await queryRunner.query(`CREATE TABLE "user_link_custom" ("id" bigint NOT NULL, "type" "public"."user_link_custom_type_enum" NOT NULL DEFAULT 'Custom', "title" character varying(32), "url" character varying(90), "enabled" boolean NOT NULL DEFAULT true, "clickCnt" bigint NOT NULL DEFAULT '0', "linkStyle" "public"."user_link_custom_linkstyle_enum" NOT NULL DEFAULT 'TextOnly', "imageType" "public"."user_link_custom_imagetype_enum" NOT NULL DEFAULT 'File', "imageUrl" character varying, "prioritizeType" "public"."user_link_custom_prioritizetype_enum" NOT NULL DEFAULT 'Animations', "prioritizeId" integer NOT NULL DEFAULT '0', "lockType" "public"."user_link_custom_locktype_enum" NOT NULL DEFAULT 'None', "lockEnabled" boolean NOT NULL DEFAULT false, "lockCode" character varying(32), "lockAge" character varying(32), "lockDescription" character varying(64), "clockType" "public"."user_link_custom_clocktype_enum" NOT NULL DEFAULT 'None', "clockEnabled" boolean NOT NULL DEFAULT false, "clockStamp1" TIMESTAMP, "clockStamp2" TIMESTAMP, "clockZone1" character varying(32), "clockZone2" character varying(32), "profileId" bigint, CONSTRAINT "PK_4e4f0ea165e558d715e2847010c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_link_embed" ("id" bigint NOT NULL, "type" character varying(32) NOT NULL, "url" character varying(32) NOT NULL, "profileId" bigint, CONSTRAINT "PK_e606a4434ec39c39d81a3374bfa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_account" ("id" bigint NOT NULL, "username" character varying(32), "description" character varying(90), "avatarUrl" character varying(90), "phoneNumber" character varying(32), "timezone" character varying DEFAULT '32', CONSTRAINT "PK_6acfec7285fdf9f463462de3e9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscription" ("id" bigint NOT NULL, "subscriptionId" character varying, "plan" character varying NOT NULL, "status" character varying NOT NULL, "startSubscriptionAt" bigint, "nextBillingAt" bigint, "endSubscriptionAt" bigint, "ownerId" bigint, CONSTRAINT "REL_567ea867f45fdcb0423f10849b" UNIQUE ("ownerId"), CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profile_interest_categories_data_interest_category" ("profileId" bigint NOT NULL, "dataInterestCategoryId" bigint NOT NULL, CONSTRAINT "PK_71841af80302693de035648eccd" PRIMARY KEY ("profileId", "dataInterestCategoryId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0fa7df810cbfbf655f784e45cd" ON "profile_interest_categories_data_interest_category" ("profileId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ff99d99afb26791fba3ac0305" ON "profile_interest_categories_data_interest_category" ("dataInterestCategoryId") `);
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "linkname" character varying(32) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "categories" text`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "accountId" bigint`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "UQ_36059b560e94dbaa061527a85ce" UNIQUE ("accountId")`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "templateId" bigint`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "UQ_0747c3f5c82699f9f4cf10bd3c1" UNIQUE ("templateId")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d89f2814a032290569666b5ca1" ON "profile" ("linkname") `);
        await queryRunner.query(`ALTER TABLE "data_interest_item" ADD CONSTRAINT "FK_faaf97d14c4f722bee27115d0a1" FOREIGN KEY ("categoryId") REFERENCES "data_interest_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_link_social" ADD CONSTRAINT "FK_35dc5b13e3cf589fd6758449326" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_link_custom" ADD CONSTRAINT "FK_473d05a33b27ee5c0c2ba38921f" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_link_embed" ADD CONSTRAINT "FK_d8ecea29f27f5bb2e0c62da8424" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "FK_36059b560e94dbaa061527a85ce" FOREIGN KEY ("accountId") REFERENCES "user_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "FK_0747c3f5c82699f9f4cf10bd3c1" FOREIGN KEY ("templateId") REFERENCES "user_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD CONSTRAINT "FK_567ea867f45fdcb0423f10849b3" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profile_interest_categories_data_interest_category" ADD CONSTRAINT "FK_0fa7df810cbfbf655f784e45cdc" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "profile_interest_categories_data_interest_category" ADD CONSTRAINT "FK_4ff99d99afb26791fba3ac03052" FOREIGN KEY ("dataInterestCategoryId") REFERENCES "data_interest_category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile_interest_categories_data_interest_category" DROP CONSTRAINT "FK_4ff99d99afb26791fba3ac03052"`);
        await queryRunner.query(`ALTER TABLE "profile_interest_categories_data_interest_category" DROP CONSTRAINT "FK_0fa7df810cbfbf655f784e45cdc"`);
        await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_567ea867f45fdcb0423f10849b3"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "FK_0747c3f5c82699f9f4cf10bd3c1"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "FK_36059b560e94dbaa061527a85ce"`);
        await queryRunner.query(`ALTER TABLE "user_link_embed" DROP CONSTRAINT "FK_d8ecea29f27f5bb2e0c62da8424"`);
        await queryRunner.query(`ALTER TABLE "user_link_custom" DROP CONSTRAINT "FK_473d05a33b27ee5c0c2ba38921f"`);
        await queryRunner.query(`ALTER TABLE "user_link_social" DROP CONSTRAINT "FK_35dc5b13e3cf589fd6758449326"`);
        await queryRunner.query(`ALTER TABLE "data_interest_item" DROP CONSTRAINT "FK_faaf97d14c4f722bee27115d0a1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d89f2814a032290569666b5ca1"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "UQ_0747c3f5c82699f9f4cf10bd3c1"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "templateId"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "UQ_36059b560e94dbaa061527a85ce"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "accountId"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "categories"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "linkname"`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "username" character varying(32) NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ff99d99afb26791fba3ac0305"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0fa7df810cbfbf655f784e45cd"`);
        await queryRunner.query(`DROP TABLE "profile_interest_categories_data_interest_category"`);
        await queryRunner.query(`DROP TABLE "subscription"`);
        await queryRunner.query(`DROP TABLE "user_account"`);
        await queryRunner.query(`DROP TABLE "user_link_embed"`);
        await queryRunner.query(`DROP TABLE "user_link_custom"`);
        await queryRunner.query(`DROP TYPE "public"."user_link_custom_clocktype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_link_custom_locktype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_link_custom_prioritizetype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_link_custom_imagetype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_link_custom_linkstyle_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_link_custom_type_enum"`);
        await queryRunner.query(`DROP TABLE "user_link_social"`);
        await queryRunner.query(`DROP TABLE "user_template"`);
        await queryRunner.query(`DROP TYPE "public"."user_template_btnstyle_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_template_backgroundtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_template_templatetype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_26561961e7123bf25841ddccf8"`);
        await queryRunner.query(`DROP TABLE "data_interest_category"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_43dbc1bad943aea885125c7cea"`);
        await queryRunner.query(`DROP TABLE "data_interest_item"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ffc8e90a74458730b9b7b00add"`);
        await queryRunner.query(`DROP TABLE "black_word"`);
        await queryRunner.query(`DROP TYPE "public"."black_word_type_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d80b94dc62f7467403009d8806" ON "profile" ("username") `);
    }

}
