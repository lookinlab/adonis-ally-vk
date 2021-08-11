Make sure to first define the mapping inside the `contracts/ally.ts` file as follows.

```ts
import { VkDriver, VkDriverConfig } from 'adonis-ally-vk/build/standalone'

declare module '@ioc:Adonis/Addons/Ally' {
  interface SocialProviders {
    // ... other mappings
    vk: {
      config: VkDriverConfig
      implementation: VkDriver
    }
  }
}
```
