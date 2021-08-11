/*
 * adonis-ally-vk
 *
 * (c) Lookin Anton <lookin@lookinlab.ru>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class VkDriverProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const Ally = this.app.container.resolveBinding('Adonis/Addons/Ally')
    const { VkDriver } = await import('../src/Vk')

    Ally.extend('vk', (_, __, config, ctx) => {
      return new VkDriver(ctx, config)
    })
  }
}
