import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1677944838460 implements MigrationInterface {
    name = 'Initial1677944838460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" bigint NOT NULL, "username" character varying(32) NOT NULL, "email" character varying(128) NOT NULL, "passwordHash" character varying(256) NOT NULL, "totpSecret" character varying(20), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
