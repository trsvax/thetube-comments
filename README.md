# thetube-comments

A comment system spec for theTube. GraphQL schema + reference client + processor.

## How to use

Point AI at this repo and your platform spec:

```
"Read the comment schema at github.com/trsvax/thetube-comments/schema.graphql
and the platform spec at github.com/trsvax/theTube/.kiro/specs/platform/requirements.md.
Implement comments for my site."
```

AI generates the implementation native to your site. No generic code to override. No compatibility issues.

## Operations

| Operation | Directive | Description |
|---|---|---|
| `addComment` | `@moderate @rateLimit` | Submit a comment. Always batch (? path). 202 always. |
| `editComment` | `@auth` | Edit a comment (future). |
| `deleteComment` | `@auth` | Soft-delete a comment (future). |
| `comments` | — | Fetch `/comments/{pageUuid}/index.json`. One request, all comments. |

## Write path

```
POST /tube/comment/open?page={pageUuid}  → get token
POST /tube/comment/add?page={uuid}&body=...&author=...&token=...&id=...  → 202
```

CloudFront Function logs it. Processor (Lambda) reads logs, validates, writes files.

## Storage

Comments are JSON files at URLs:

```
/comments/{pageUuid}/{requestId}.json   ← individual comment (immutable)
/comments/{pageUuid}/index.json         ← all comments rolled up (regenerated)
```

Filenames are CloudFront request IDs — server-generated, unique, untouchable by the client.

## Schema

See `schema.graphql` for types, operations, and directives. `DESIGN.md` for the full architecture.
