// Comment processor — triggered by CloudFront log delivery to S3
// Reads log entries, validates, writes comment files, regenerates index.json

import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { createHmac } from "node:crypto";
import { gunzipSync } from "node:zlib";

const s3 = new S3Client({});
const BUCKET = process.env.BUCKET;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const MAX_BODY_LENGTH = 1000;
const COMMENT_PATH_RE = /^\/w\/comment\/add\?(.+)$/;

export async function handler(event) {
  // Log delivery puts gzipped log files in S3
  for (const record of event.Records) {
    const logKey = record.s3.object.key;
    const logBody = await getObject(logKey);
    const lines = gunzipSync(logBody).toString().split("\n");

    // Track which page UUIDs were modified (for index regeneration)
    const modified = new Set();

    for (const line of lines) {
      if (line.startsWith("#") || !line.trim()) continue;
      const entry = parseLogLine(line);
      if (!entry) continue;

      const match = entry.path.match(COMMENT_PATH_RE);
      if (!match) continue;

      const params = Object.fromEntries(new URLSearchParams(match[1]));
      if (!validate(params)) continue;

      // Write comment file (request ID as filename, create-only)
      const commentKey = `comments/${params.page}/${entry.requestId}.json`;
      const comment = {
        requestId: entry.requestId,
        body: params.body,
        author: params.author || "anonymous",
        date: entry.timestamp,
      };

      const written = await putIfNotExists(commentKey, JSON.stringify(comment));
      if (written) modified.add(params.page);
    }

    // Regenerate index.json for each modified page
    for (const page of modified) {
      await regenerateIndex(page);
    }
  }
}

// --- Validation ---

// Validates a comment submission. Returns true if the comment should be processed.
// Today: hand-written checks. Tomorrow: schema-driven validation (GraphQL).
function validate(params) {
  if (!params.page || !params.body || !params.token || !params.id) return false;
  if (params.body.length > MAX_BODY_LENGTH) return false;
  if (!validateToken(params.token, params.page)) return false;
  return true;
}

// --- Token ---

function validateToken(token, page) {
  // Token format: signature.timestamp
  // Accept tokens where timestamp is within 48 hours
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [sig, timestamp] = parts;
  const age = Date.now() - Number(timestamp);
  if (age > 48 * 60 * 60 * 1000 || age < 0) return false;

  const expected = createHmac("sha256", TOKEN_SECRET)
    .update(`${page}.${timestamp}`)
    .digest("hex");

  return sig === expected;
}

// --- S3 ---

async function getObject(key) {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return Buffer.from(await res.Body.transformToByteArray());
}

async function putIfNotExists(key, body) {
  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: "application/json",
      IfNoneMatch: "*",
    }));
    return true;
  } catch (err) {
    // 412 = object already exists
    if (err.name === "PreconditionFailed" || err.$metadata?.httpStatusCode === 412) {
      return false;
    }
    throw err;
  }
}

async function regenerateIndex(page) {
  const prefix = `comments/${page}/`;
  const res = await s3.send(new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  }));

  const commentKeys = (res.Contents || [])
    .map((obj) => obj.Key)
    .filter((key) => key !== `${prefix}index.json`);

  // Fetch all comment files
  const comments = await Promise.all(
    commentKeys.map(async (key) => {
      const data = await getObject(key);
      return JSON.parse(data.toString());
    }),
  );

  // Sort by date (newest first)
  comments.sort((a, b) => (a.date < b.date ? 1 : -1));

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: `${prefix}index.json`,
    Body: JSON.stringify(comments, null, 2),
    ContentType: "application/json",
  }));
}

// --- Log parsing ---

function parseLogLine(line) {
  // CloudFront log format: tab-separated fields
  const fields = line.split("\t");
  if (fields.length < 12) return null;

  const date = fields[0];
  const time = fields[1];
  const method = fields[5];
  const path = fields[7];
  const query = fields[11];
  const requestId = fields[14] || crypto.randomUUID();

  if (method !== "POST") return null;

  return {
    timestamp: `${date}T${time}Z`,
    path: query ? `${path}?${query}` : path,
    requestId,
  };
}
