# Adonis Ally Vk Driver

A driver of AdonisJS Ally for vk.com (vkontakte)

## Installation

Make sure to install it using `npm` or `yarn`.

```bash
# npm
npm i adonis-ally-vk
node ace configure adonis-ally-vk

# yarn
yarn add adonis-ally-vk
node ace configure adonis-ally-vk
```

Open a `instructions.md` file after configure

## Usage

Make sure to register the provider inside `.adonisrc.json` file.
```json
{
  "providers": [
    "...other packages",
    "adonis-ally-vk"
  ] 
}
```

For TypeScript projects add to `tsconfig.json` file:
```json
{
  "compilerOptions": {
    "types": [
      "...other packages",
      "adonis-ally-vk"
    ]
  } 
}
```

More about [AdonisJS Ally](https://docs.adonisjs.com/guides/auth/social) and as usage this driver

## An available configuration options

```ts
const allyConfig: AllyConfig = {
  // ... other drivers
  vk: {
    // ... config

    display: 'page',
    scopes: ['email', '...other'],
    fields: ['screen_name', 'bdate', '...other']
  },
}
```
