# Introduction

CSV (or Google Sheets) is an easy to used data format. But it is quite unpredictable, and not that flexible. We aim to help you with **"Sheethuahua"**, a set of schemas, transformers, type-safe parsers and formatters. What you need to do is:

1. Define the **output schema** and **how each column is mapped and transformed**
2. Use the parser or formatter function to **validate and transform** CSV to JavaScript data and vice versa.

Using [TypeBox](https://github.com/sinclairzx81/typebox), [d3-dsv](https://d3js.org/d3-dsv), [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) (and [Tempo](https://tempo.formkit.com) for date transformer) under the hood, Sheethuahua should be supported by every modern browsers and back-end runtime.

## Notes for Google Sheets

Google Sheets has a great potential of being an API read-only database with a user-friendly interface for content editor. But it has [a very low rate limit](https://developers.google.com/sheets/api/limits). **It should be used with Static Site Generation (SSG), cache, or both**.

> WeVis's [Parliament Watch](https://parliamentwatch.wevis.info/) use Google Sheets as a database with SSG.
