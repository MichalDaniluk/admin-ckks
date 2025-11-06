import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInstructorIdToCourseSessions1762353001817 implements MigrationInterface {
    name = 'AddInstructorIdToCourseSessions1762353001817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_session" ADD "instructor_id" uuid`);
        await queryRunner.query(`ALTER TABLE "course_session" ADD CONSTRAINT "FK_f713d48769797bbcb188a53d93d" FOREIGN KEY ("instructor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_session" DROP CONSTRAINT "FK_f713d48769797bbcb188a53d93d"`);
        await queryRunner.query(`ALTER TABLE "course_session" DROP COLUMN "instructor_id"`);
    }

}
