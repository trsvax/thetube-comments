// Output validator — NOT YET IMPLEMENTED
//
// Reads comment files from /comments/ on S3 and validates each one
// against the schema. Flags any file that doesn't conform.
//
// Purpose: regression test. Catches processor bugs that write malformed data.
// No runtime cost — runs on demand or on a schedule, not on the hot path.
//
// Usage (future):
//   node validate-output.mjs --bucket <bucket> --prefix comments/
//
// What it checks:
//   - Required fields present (requestId, body, author, date)
//   - Field types correct (string, not null)
//   - No unexpected fields
//   - Dates are valid ISO timestamps
//   - Body within MAX_BODY_LENGTH
//   - index.json matches the individual files (no drift)
//
// Could later validate against schema.graphql directly (graphql library).
// For now, hand-written checks matching the processor's validate() function.
//
// The files are the truth. Check the truth.
