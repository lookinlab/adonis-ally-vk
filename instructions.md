The package has been configured successfully.

Make sure to first define the mapping inside the `contracts/ally.ts` file as follows.

```ts
declare module '@ioc:Adonis/Addons/Ally' {
  import { VkDriver, VkDriverConfig } from 'adonis-ally-vk/build/standalone'

  interface SocialProviders {
    // ... other mappings
    vk: {
      config: VkDriverConfig
      implementation: VkDriver
    }
  }
}
```

Ally config relies on environment variables for the client id and secret.
We recommend you to validate environment variables inside the `env.ts` file.

## Variables for VK driver

```ts
VK_CLIENT_ID: Env.schema.string(),
VK_CLIENT_SECRET: Env.schema.string(),
```

## Ally config for VK driver

```ts
const allyConfig: AllyConfig = {
  // ... other drivers
  vk: {
    driver: 'vk',
    clientId: Env.get('VK_CLIENT_ID'),
    clientSecret: Env.get('VK_CLIENT_SECRET'),
    callbackUrl: 'http://localhost:3333/vk',
  },
}
```
