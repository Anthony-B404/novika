/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UsersController = () => import('#controllers/users_controller')
const OrganizationsController = () => import('#controllers/organizations_controller')
const InvitationsController = () => import('#controllers/invitations_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Public routes
router.post('/register', [UsersController, 'register'])
router.post('/login', [UsersController, 'login'])
router.post('/signup', [OrganizationsController, 'signupWithOrganization'])

router.get('/organization-logo/:logo', [OrganizationsController, 'getOrganizationLogo'])

router.get('/check-invitation/:identifier', [InvitationsController, 'checkInvitation'])
router.post('/accept-invitation', [InvitationsController, 'acceptInvitation'])

router.get('/verify-email/:token', [UsersController, 'verifyEmail'])

// Protected routes
router
  .group(() => {
    // User routes
    router.post('/logout', [UsersController, 'logout'])
    router.get('/me', [UsersController, 'me'])
    router.get('/check-token', [UsersController, 'checkToken'])
    router.post('/resend-verification', [UsersController, 'resendVerification'])
    router.get('/check-email-verification', [UsersController, 'checkEmailVerification'])
    router.delete('/delete-member/:id', [UsersController, 'deleteMember'])

    // Organization routes
    router.get('/organization', [OrganizationsController, 'getOrganizationWithUsers'])
    router.put('/organization/update', [OrganizationsController, 'updateOrganization'])

    // Invitation routes
    router.post('/invite-member', [InvitationsController, 'createInvitation'])
    router.delete('/delete-invitation/:id', [InvitationsController, 'deleteInvitation'])
  })
  .use(middleware.auth({ guards: ['api'] }))
