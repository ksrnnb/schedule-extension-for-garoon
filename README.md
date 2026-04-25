# Schedule Extension for Garoon

A Chrome extension that enhances schedule notifications for Garoon, the groupware product from Cybozu, Inc. Stay on top of upcoming events with reminders, view today's schedule from the toolbar popup, and see the time of your next event right on the toolbar icon.

## About this project

This is a personal side project. It is **not** an official Cybozu product. Everything in this repo is the author's own work and views, not Cybozu's.

"Garoon" is a registered trademark of Cybozu, Inc. The name appears here only to describe what this extension works with.

## Features

- Periodic fetching (every minute) of today's events from Garoon
- Desktop notifications for upcoming events
- Toolbar icon showing the start time of the next event today
- Toolbar popup listing today's schedule with past/ongoing state
- Configurable notification lead time and ignore-by-keyword filter
- Authentication-failure notification with an error badge on the toolbar icon

## Development

This project uses [pnpm](https://pnpm.io/) and webpack.

```sh
pnpm install
pnpm build:dev   # development build
pnpm build       # production build (also creates archive.zip)
pnpm start       # watch mode
```

The build output is written to `dist/`. Load it as an unpacked extension from Chrome's extension page (`chrome://extensions`) with developer mode enabled.

## Acknowledgements

This project is based on [kamiaka/garoon-chrome-extension](https://github.com/kamiaka/garoon-chrome-extension) by Shinya Kamiaka, originally released under the MIT License. The code was used as a starting point and has been substantially modified. See [LICENSE](./LICENSE) for the full notice.

## Icons

The popup's refresh and settings icons are the `refresh-ccw` and `settings` icons from [Lucide](https://lucide.dev/), licensed under the [ISC License](https://lucide.dev/license).

## License

Released under the MIT License. See [LICENSE](./LICENSE) for details.
