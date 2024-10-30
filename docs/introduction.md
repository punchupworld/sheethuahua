# Introduction

CSV (or Google Sheets) is quite unpredictable, and not that flexible. We aim to help that with a set of schema, transformer functions and type-safe parser. What you need to do is:

1. Define the **output schema** and **how each column is mapped and transformed**
2. Use the parser function to **get it, validate it, and parsed it**

Using [TypeBox](https://github.com/sinclairzx81/typebox), [d3-dsv](https://d3js.org/d3-dsv) and [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) under the hood, Sheethuahua should be supported by every modern browsers and back-end runtime.

## Notes for Google Sheets

Google Sheets has a great potential of being an API read-only database with a user friendly interface for content editor. But it has [a very low rate limit](https://developers.google.com/sheets/api/limits). Google Sheets with Sheethuahua **should be used with Static Site Generation (SSG), cache, or both**.

> WeVis's [Parliament Watch](https://parliamentwatch.wevis.info/) use Google Sheets as a database with SSG.
