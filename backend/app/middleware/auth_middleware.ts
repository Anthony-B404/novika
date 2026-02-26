import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    // Allow token via query parameter for streaming endpoints (e.g. TTS).
    // iOS Safari cannot set Authorization headers on <audio src="...">,
    // so the frontend passes the token as ?token= instead.
    if (!ctx.request.header('authorization') && ctx.request.input('token')) {
      ctx.request.request.headers['authorization'] = `Bearer ${ctx.request.input('token')}`
    }

    await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
    return next()
  }
}
