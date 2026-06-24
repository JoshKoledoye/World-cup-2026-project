# backend

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.13. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

---

## Polls API

The Polls API is exposed at `/polls` and supports public read and vote operations, while create/update/delete are restricted to admin users.

### Environment configuration

The admin user(s) are configured with env vars in the backend process.

- `POLL_ADMIN_ID`: single Clerk user ID for admin access
- `POLL_ADMIN_IDS`: optional comma-separated list of Clerk user IDs

If neither is set, admin routes return `403 Forbidden`.

### Authentication

- `GET /polls` and `GET /polls/:id` are public.
- `PATCH /polls/:id/vote` requires authentication.
- `POST /polls`, `PUT /polls/:id`, and `DELETE /polls/:id` require admin access.

Authentication is expected to be provided by Clerk via bearer token headers.

### Endpoints

#### List polls

- Method: `GET`
- Path: `/polls`
- Auth: none
- Response:
  ```json
  {
    "success": true,
    "polls": [
      {
        "id": "...",
        "question": "...",
        "options": [{ "text": "...", "votes": 0 }],
        "createdAt": "..."
      }
    ]
  }
  ```

#### Get poll

- Method: `GET`
- Path: `/polls/:id`
- Auth: none
- Response:
  ```json
  {
    "success": true,
    "poll": {
      "id": "...",
      "question": "...",
      "options": [{ "text": "...", "votes": 0 }],
      "createdAt": "..."
    }
  }
  ```

#### Vote on a poll

- Method: `PATCH`
- Path: `/polls/:id/vote`
- Auth: required
- Body:
  ```json
  {
    "optionIndex": 0
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Vote recorded",
    "poll": { ... }
  }
  ```

#### Create a poll

- Method: `POST`
- Path: `/polls`
- Auth: admin required
- Body:
  ```json
  {
    "question": "Who will win?",
    "options": [
      { "text": "Team A", "votes": 0 },
      { "text": "Team B", "votes": 0 }
    ]
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Poll created",
    "poll": { ... }
  }
  ```

#### Update a poll

- Method: `PUT`
- Path: `/polls/:id`
- Auth: admin required
- Body: same shape as create (but only valid fields are required)
- Response:
  ```json
  {
    "success": true,
    "message": "Poll updated",
    "poll": { ... }
  }
  ```

#### Delete a poll

- Method: `DELETE`
- Path: `/polls/:id`
- Auth: admin required
- Response:
  ```json
  {
    "success": true,
    "message": "Poll deleted",
    "poll": { ... }
  }
  ```

### Error responses

Standard error response shape:

```json
{
  "success": false,
  "error": "Poll not found"
}
```

### Recommended delivery for other developers

1. **Markdown docs**: keep the Polls API section in `Backend/README.md` or a dedicated `docs/polls-api.md` for humans and agents.
2. **OpenAPI / Swagger**: generate a machine-readable contract for frontend developers and automation.
3. **Client wrapper**: provide a shared API client module (`Frontend/src/apis/polls.api.js`) so frontend code can use typed methods instead of raw fetch.
4. **Postman / Insomnia collection**: add examples for quick manual testing.
5. **Inline comments**: keep route auth requirements visible in code and README.

### Best practice for teams and agents

- Use a single source of truth: API contract + example payloads in Markdown.
- Pair the contract with a generated client or API helper.
- Publish the docs near the backend code and reference them from frontend onboarding.
- Agents can consume Markdown or OpenAPI most easily, so both are ideal.
