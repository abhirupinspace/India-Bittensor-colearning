---
title: 'Lessons Learned'
sidebar_position: 3
description: 'A short retro template for reflecting on your HackQuest × Bittensor Co-Learning Camp #23 India experience.'
---

# Lessons Learned

Before you graduate, run a quick retro. The goal isn't a report — it's to lock in what you learned so your next miner is better.

## Retro Template

Fill in a few bullets for each:

- **What worked** — the setup, strategy, or tool that paid off
- **What was hard** — where you got stuck and how long it took
- **What surprised you** — anything that broke your mental model
- **What you'd do next** — the first thing you'd change on a fresh run

Keep it to half a page. Share it in your showcase or write-up.

## Common Pitfalls

- **Endpoint unreachable** — firewall closed, CGNAT, or wrong IP in config → validators can't query → zero score
- **Stale data / old predictions** — freshness matters; scraping archives or lagging the closing line tanks rewards
- **No monitoring** — a dead scraper or crashed miner goes unnoticed for days without an alert
- **Leaked secrets** — `.env` or `config.yaml` committed to git
- **Over-optimizing too early** — chasing noise instead of getting a stable baseline running first
