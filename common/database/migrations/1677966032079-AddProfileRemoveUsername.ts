import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileRemoveUsername1677966032079 implements MigrationInterface {
    name = 'AddProfileRemoveUsername1677966032079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_78a916df40e02a9deb1c4b75ed"`);
        await queryRunner.query(`CREATE TABLE "profile" ("id" bigint NOT NULL, "username" character varying(32) NOT NULL, "ownerId" bigint, CONSTRAINT "REL_552aa6698bb78970f6569161ec" UNIQUE ("ownerId"), CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d80b94dc62f7467403009d8806" ON "profile" ("username") `);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "passwordHash" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "FK_552aa6698bb78970f6569161ec0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "FK_552aa6698bb78970f6569161ec0"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "passwordHash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "username" character varying(32) NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d80b94dc62f7467403009d8806"`);
        await queryRunner.query(`DROP TABLE "profile"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user" ("username") `);
    }

}
