# thetube-comments

A comment system spec. No code — just a GraphQL schema.

## How to use

Point AI at this schema and your platform spec:

```
"Read the comment schema at github.com/trsvax/thetube-comments/schema.graphql
and the platform spec at github.com/trsvax/theTube/.kiro/specs/platform/requirements.md.
Implement comments for my site."
```

AI generates the implementation native to your site. No generic code to override. No compatibility issues.

## Operations

| Operation | Directive | Description |
|---|---|---|
| `addComment` | `@moderate` | Submit for review. Batch processed. |
| `addCommentRealtime` | `@realtime @auth` | Appears immediately. Requires login. |
| `comments` | — | Fetch comments for a post. Returns a file. |

## Storage

Comments are files at URLs. `comments/<post>.txt`. Append-only. The file is the database.

## Schema

See `schema.graphql` for types, operations, and directives. The platform spec defines how directives map to transport.
