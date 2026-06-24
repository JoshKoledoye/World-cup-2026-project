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

The admin user is configured with env vars in the backend process.

- `ADMIN_ID`: single Clerk user ID for admin access

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
