# thetube-comments

A comment system spec for the theTube platform. No code — just a GraphQL schema that describes what comments do.

## How to use

Point AI at this schema and your platform spec. AI generates the implementation native to your site.

```
"Read the comment schema at github.com/trsvax/thetube-comments/schema.graphql
and the platform spec at github.com/trsvax/theTube/.kiro/specs/platform/requirements.md.
Implement comments for my site."
```

## Two modes

- **Moderated** (`@moderate`) — comments go to the event log, you review and approve. Batch processing.
- **Real-time** (`@realtime`) — comments are processed immediately by a Lambda. Sub-second. Requires auth.

## The contract

- Submit: `GET /events/comment/submit?post=<slug>&body=<text>&author=<name>` (moderated)
- Submit: `POST /fastevent/comment` with JSON body (real-time, returns `Location` header)
- Read: `GET /comments/<post>.txt` — plain text file, one comment per line

## Storage

Comments are files at URLs. `comments/<post>.txt` in S3. Append-only. The file is the database.

## Schema

See `schema.graphql` for the full type definitions and directives.
