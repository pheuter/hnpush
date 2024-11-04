# HN Push

Web push notifications for top stories on Hacker News.

## Features

- 🔔 Real-time push notifications for trending stories
- 📱 Progressive Web App (PWA) for easy mobile access
- 🌓 Dark mode support
- ⚡️ Built with [Svelte](https://svelte.dev)
- 🔒 Privacy-focused with no tracking or analytics

## How It Works

1. A cron job runs every minute to fetch top stories from Hacker News
2. New stories with 30+ points trigger push notifications
3. Each visitor gets a unique password stored in a cookie
4. Subscriptions are stored in Redis using the cookie password as an identifier
5. Subscribers receive notifications with the story title and author
6. Clicking a notification opens the story on Hacker News
