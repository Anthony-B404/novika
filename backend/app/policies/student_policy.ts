import User from '#models/user'
import Student from '#models/student'
import Class from '#models/class'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class StudentPolicy extends BasePolicy {
  public async before(user: User | null) {
    if (!user) return false
  }

  public async create(user: User, classId: number): Promise<AuthorizerResponse> {
    if (user.role !== 1) return false
    const classItem = await Class.find(classId)
    return classItem?.organizationId === user.organizationId
  }

  public async update(user: User, student: Student): Promise<AuthorizerResponse> {
    if (user.role !== 1) return false
    const classItem = await Class.find(student.classId)
    return classItem?.organizationId === user.organizationId
  }

  public async delete(user: User, student: Student): Promise<AuthorizerResponse> {
    console.log('user', user)
    console.log('student', student)
    if (user.role !== 1) return false
    const classItem = await Class.find(student.classId)
    return classItem?.organizationId === user.organizationId
  }

  public async view(user: User, student: Student): Promise<AuthorizerResponse> {
    const classItem = await Class.find(student.classId)
    return classItem?.organizationId === user.organizationId
  }
}
