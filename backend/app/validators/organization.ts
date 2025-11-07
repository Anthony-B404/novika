import vine from '@vinejs/vine'

export const createOrganizationValidator = vine.compile(
  vine.object({
    name: vine.string(),
    logo: vine.string().optional(),
    email: vine
      .string()
      .email()
      .unique(async (db, value) => {
        const organization = await db.from('organizations').where('email', value).first()
        return !organization
      }),
  })
)
