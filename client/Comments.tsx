"use client";

import { useState } from "react";
import { useQuery, useMutate } from "@/lib/hooks";

interface Comment {
  requestId: string;
  body: string;
  author: string;
  date: string;
  deleted?: boolean;
}

// The comment space UUID comes from the post's frontmatter
export default function Comments({ pageUuid }: { pageUuid: string }) {
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");

  const { data: comments, refetch } = useQuery<Comment[]>(
    `/comments/${pageUuid}/index.json`,
  );

  // useMutate calls /w/comment/open internally on first mutate()
  // caches the fd (token) for subsequent calls
  const { mutate, status, trust } = useMutate("/w/comment/add", {
    ns: "comment",
    page: pageUuid,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    await mutate({
      page: pageUuid,
      body: body.trim(),
      author: author.trim() || "anonymous",
      id: crypto.randomUUID(),
    });

    setBody("");
    refetch();
  };

  const visible = (comments ?? []).filter((c) => !c.deleted);

  return (
    <section className="comments">
      <h2>Comments</h2>

      {visible.length === 0 && (
        <p className="comments-empty">No comments yet.</p>
      )}

      <ul className="comments-list">
        {visible.map((comment) => (
          <li key={comment.requestId} className="comment">
            <div className="comment-meta">
              <span className="comment-author">{comment.author}</span>
              <time className="comment-date">
                {new Date(comment.date).toLocaleDateString()}
              </time>
            </div>
            <p className="comment-body">{comment.body}</p>
          </li>
        ))}
      </ul>

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="comment-input"
          placeholder="Name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <textarea
          className="comment-textarea"
          placeholder="Write a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          required
        />
        <div className="comment-form-footer">
          <button
            type="submit"
            className="comment-submit"
            disabled={status === "loading" || !body.trim()}
          >
            {status === "loading" ? "Submitting..." : "Submit"}
          </button>
          {status === "success" && (
            <span className="comment-status success">
              {trust === "low"
                ? "Comment submitted for review."
                : "Comment posted."}
            </span>
          )}
          {status === "error" && (
            <span className="comment-status error">
              Couldn't submit. Try again.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
