import { BaseSchema } from '@adonisjs/lucid/schema'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('role_int').checkIn(['1', '2']).notNullable().defaultTo(2)

      db.rawQuery(`
        UPDATE users
        SET role_int = CASE
          WHEN role = 'admin' THEN 1
          WHEN role = 'teacher' THEN 2
          WHEN role = 'student' THEN 3
          ELSE 3
        END
      `)
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
      table.renameColumn('role_int', 'role')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('role_string', ['admin', 'teacher', 'student']).notNullable().defaultTo('student')
      db.rawQuery(`
        UPDATE users
        SET role_string = CASE
          WHEN role_int = 1 THEN 'admin'
          WHEN role_int = 2 THEN 'teacher'
          WHEN role_int = 3 THEN 'student'
          ELSE 'student'
        END
      `)
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
      table.renameColumn('role_string', 'role')
    })
  }
}
