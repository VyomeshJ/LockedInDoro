# LockedInDoro

LockedInDoro is a Pomodoro study app built with Next.js. It includes a timer, study stats, ambient sounds, account login, and saved user settings.

Live app: [https://lockedindoro.vyomeshj.com/](https://lockedindoro.vyomeshj.com/)

## Important: One Active Tab Per Account

Each account can only be active in one browser tab at a time.

This also applies across different devices. For example, if the same account is open on a laptop and a phone, the app will show an overlay asking you to close one of them. The overlay disappears automatically once only one tab or device remains active.


## Tech Stack

- Next.js
- React
- NextAuth
- PostgreSQL
- Tailwind CSS

## Database

The app uses SQL schema files in the `sql/` directory.

Make sure the database includes the app tables, including `tab_presence`, which is used to enforce the one-active-tab-per-account behavior across tabs and devices.
