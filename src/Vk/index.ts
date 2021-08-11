/*
 * adonis-ally-vk
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { AllyUserContract, LiteralStringUnion } from '@ioc:Adonis/Addons/Ally'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Oauth2Driver, ApiRequest, RedirectRequest } from '@adonisjs/ally/build/standalone'

/**
 * Define the access token object properties in this type. It
 * must have "token" and "type" and you are free to add
 * more properties.
 */
export type VkAccessToken = {
  token: string
  type: 'bearer'
  email: string
  expires_in: number
  user_id: number
}

/**
 * Driver scopes
 * See https://vk.com/dev/permissions
 */
export type VkScopes =
  | 'notify'
  | 'friends'
  | 'photos'
  | 'audio'
  | 'video'
  | 'stories'
  | 'pages'
  | 'status'
  | 'notes'
  | 'messages'
  | 'wall'
  | 'ads'
  | 'offline'
  | 'docs'
  | 'groups'
  | 'notifications'
  | 'stats'
  | 'email'
  | 'market'

/**
 * Driver config
 */
export type VkDriverConfig = {
  driver: 'vk'
  clientId: string
  clientSecret: string
  callbackUrl: string
  authorizeUrl?: string
  accessTokenUrl?: string
  userInfoUrl?: string

  scopes?: LiteralStringUnion<VkScopes>[]
  display?: 'page' | 'popup'
  /**
   * A list available fields
   * See https://vk.com/dev/objects/user
   */
  fields?: string[]
}

/**
 * Vkontakte driver to login user via vk.com
 */
export class VkDriver extends Oauth2Driver<VkAccessToken, VkScopes> {
  /**
   * The version of api vk.com
   */
  protected apiVersion = '5.131'

  /**
   * The URL for the redirect request. The user will be redirected on this page
   * to authorize the request.
   */
  protected authorizeUrl = 'https://oauth.vk.com/authorize'

  /**
   * The URL to hit to exchange the authorization code for the access token
   */
  protected accessTokenUrl = 'https://oauth.vk.com/access_token'

  /**
   * The URL to hit to get the user details
   */
  protected userInfoUrl = 'https://api.vk.com/method/users.get'

  /**
   * The param name for the authorization code. Read the documentation of your oauth
   * provider and update the param name to match the query string field name in
   * which the oauth provider sends the authorization_code post redirect.
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error. Read the documentation of your oauth provider and update
   * the param name to match the query string field name in which the oauth provider sends
   * the error post redirect
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the CSRF token. Make sure it is always unique. So a better
   * approach is to prefix the oauth provider name to `oauth_state` value.
   */
  protected stateCookieName = 'vk_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state from.
   * Read the documentation of your oauth provider and update the param
   * name to match the query string used by the provider for exchanging
   * the state.
   */
  protected stateParamName = 'state'

  /**
   * Parameter name for sending the scopes to the oauth provider.
   */
  protected scopeParamName = 'scope'

  /**
   * The separator indentifier for defining multiple scopes
   */
  protected scopesSeparator = ','

  constructor(ctx: HttpContextContract, public config: VkDriverConfig) {
    super(ctx, config)

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request.
     */
    this.loadState()
  }

  /**
   * Optionally configure the authorization redirect request. The actual request
   * is made by the base implementation of "Oauth2" driver and this is a
   * hook to pre-configure the request.
   */
  protected configureRedirectRequest(request: RedirectRequest<VkScopes>) {
    /**
     * Define user defined scopes of the default one`s
     */
    request.scopes(this.config.scopes || ['email'])
    request.param('display', this.config.display || 'page')
    request.param('response_type', 'code')
  }

  /**
   * Optionally configure the access token request. The actual request is made by
   * the base implementation of "Oauth2" driver and this is a hook to pre-configure
   * the request
   */
  // protected configureAccessTokenRequest(request: ApiRequest) {}

  /**
   * Update the implementation to tell if the error received during redirect
   * means "ACCESS DENIED".
   */
  public accessDenied() {
    return this.ctx.request.input('error') === 'user_denied'
  }

  /**
   * Get the user details by query the provider API. This method must return
   * the access token and the user details both.
   */
  public async user(
    callback?: (request: ApiRequest) => void
  ): Promise<AllyUserContract<VkAccessToken>> {
    const accessToken = await this.accessToken()
    const user = await this.getUserInfo(accessToken.token, callback)

    return {
      ...user,
      email: accessToken.email,
      token: accessToken,
    }
  }

  /**
   * Finds the user by the access token
   */
  public async userFromToken(
    accessToken: string,
    callback?: (request: ApiRequest) => void
  ): Promise<AllyUserContract<{ token: string; type: 'bearer' }>> {
    const user = await this.getUserInfo(accessToken, callback)

    return {
      ...user,
      email: null,
      token: { token: accessToken, type: 'bearer' as const },
    }
  }

  /**
   * Returns the request with access_token and version api
   */
  protected getAuthenticatedRequest(token: string) {
    const request = this.httpClient(this.config.userInfoUrl || this.userInfoUrl)
    request.header('Accept', 'application/json')
    request.param('access_token', token)
    request.param('v', this.apiVersion)
    request.parseAs('json')
    return request
  }

  /**
   * Returns a user info
   */
  protected async getUserInfo(
    token: string,
    callback?: (request: ApiRequest) => void
  ): Promise<Omit<AllyUserContract<VkAccessToken>, 'email' | 'token'>> {
    const request = this.getAuthenticatedRequest(token)
    /**
     * Define user defined fields of the default one`s
     */
    if (this.config.fields) {
      request.param('fields', this.config.fields.join(','))
    }

    /**
     * Allow end user to configure the request. This should be called after your custom
     * configuration, so that the user can override them (if required)
     */
    if (typeof callback === 'function') {
      callback(request)
    }

    const user = await request.get().then((data) => data?.response[0])
    const name = `${user?.last_name} ${user?.first_name}`
    const screenName = user?.screen_name || name

    return {
      id: `id${user.id}`,
      name: name,
      nickName: screenName,
      emailVerificationState: 'unsupported' as const,
      avatarUrl: null,
      original: user,
    }
  }
}
