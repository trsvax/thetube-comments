// Validation job — NOT YET IMPLEMENTED
//
// Reads all comment files in /comments/ and validates each against the schema.
// Runs on demand or on a schedule. No runtime cost on the hot path.
//
// What it does:
// 1. List all /comments/{pageUuid}/*.json files (excluding index.json)
// 2. For each file: parse JSON, check required fields, check types, check constraints
// 3. Report any files that don't conform to the schema
//
// What it catches:
// - Processor bugs that write malformed comments
// - Schema drift (fields added/removed without updating the processor)
// - Corruption from replay or manual edits
//
// Could also run against logs to compare: what the processor accepted vs what the schema allows.
// The logs are the test corpus. Real traffic, real edge cases.
//
// Usage (future):
//   node jobs/validate.mjs --bucket <bucket> --prefix comments/
//   node jobs/validate.mjs --local mock/comments/
