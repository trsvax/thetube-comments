# AGENTS.md

Guidance for automated agents working in this repository.

## Don't make assumptions. If you don't know something, say so.

---

## Project Overview

`thetube-comments` is a comment system spec for the theTube platform. It contains no code — only a GraphQL schema describing comment operations and their behavior.

This repo is a plugin. AI reads the schema here and the platform spec at `trsvax/theTube` to generate an implementation native to the target site.

---

## Architecture

```
schema.graphql    The comment operations, types, and directives
README.md         How to use this spec
AGENTS.md         This file
```

## How it works

1. The schema defines operations: `addComment`, `addCommentRealtime`, `comments`
2. Directives declare behavior: `@moderate`, `@realtime`, `@auth`
3. The platform spec (in `trsvax/theTube`) defines how directives map to transport
4. AI combines both to generate implementation code for the target site

## No code here

This repo never contains implementation code. It's a spec. The implementation is generated fresh for each site that uses it, native to that site's platform, design, and stack.

_Last updated: 2026-05-18_
