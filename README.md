# Project 9: L'Oréal Smart Routine & Product Advisor

This project turns a product browser into a routine builder that uses the OpenAI API through a Cloudflare Worker. Users can pick real L'Oréal brand products, generate a routine, and keep asking follow-up questions about the routine.

Live site: https://diazdizazter.github.io/09-prj-loreal-routine-builder/

## Features

- Browse L'Oréal products by category.
- Search products by name or keyword.
- Select and unselect products with visual feedback.
- Generate a routine with GPT-4o.
- Ask follow-up questions in chat.
- Save selected products in local storage.
- Support right-to-left layouts.

## Project Layout

- `index.html`, `style.css`, `script.js`, and `products.json` are the frontend app.
- `worker.js` is the Cloudflare Worker that forwards chat requests to OpenAI.
- `wrangler.jsonc` is the Cloudflare Worker config.
- `09-prj-loreal-routine-builder/` is the Wrangler and NPM support folder.

The files inside `09-prj-loreal-routine-builder/` are standard tooling files:

- `package.json` defines the Wrangler scripts.
- `package-lock.json` pins the exact dependency versions for repeatable installs.
- `.editorconfig` keeps basic editor formatting consistent.
- `.prettierrc` stores Prettier formatting rules.
- `.gitignore` keeps secrets, local env files, and Wrangler cache files out of git.

## Local Setup

1. Put your OpenAI key in `.dev.vars` or `.env` from the matching example file.
2. Install the Wrangler dependencies from the project folder that contains `package.json`.
3. Run the worker with `npm run dev`.

## Notes

- The Worker now trims chat history and caps completion size so requests stay smaller and less likely to overload the API.
- If the remote branch is ahead of local, pull before pushing again.
