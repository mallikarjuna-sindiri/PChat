# ChatApp Full-Stack Starter

## Architecture Overview
This project is a real-time chat system with a React + Tailwind frontend, a FastAPI backend, and WebSocket-based messaging. Authentication uses JWT and the database is PostgreSQL by default. The backend exposes REST endpoints for auth, users, friends, chats, groups, and messages, while a WebSocket channel delivers real-time updates.

### Frontend Architecture
- React with React Router for routes and protected pages.
- TailwindCSS for a clean, responsive UI.
- Auth context to store JWT in local storage.
- API service wrapper for REST calls.
- WebSocket helper to connect to chat streams.

### Backend Architecture
- FastAPI for REST APIs and WebSocket endpoints.
- SQLAlchemy models for persistence.
- JWT utilities for authentication and route protection.
- Connection manager to track active WebSocket connections per chat.

### Real-Time Flow
1. Client opens `/ws/chat/{chat_id}?token=...`.
2. Backend validates JWT and registers the connection.
3. Incoming messages are broadcast to all clients on that chat.
4. Messages are also stored using REST endpoints.

## Folder Structure

### Backend
```
backend/
  app/
    api/
      routes/
        auth.py
        users.py
        friends.py
        chats.py
        groups.py
        messages.py
        profile.py
      api_router.py
    core/
      config.py
      deps.py
      security.py
    db/
      base.py
      init_db.py
      session.py
    models/
      user.py
      friendship.py
      chat.py
      message.py
    schemas/
      auth.py
      user.py
      friendship.py
      chat.py
      group.py
      message.py
    services/
      websocket_manager.py
    utils/
      qrcode.py
  requirements.txt
  .env.example
```

### Frontend
```
frontend/
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
  .env.example
  src/
    App.jsx
    main.jsx
    styles/
      index.css
    context/
      AuthContext.jsx
    routes/
      ProtectedRoute.jsx
    pages/
      Login.jsx
      Register.jsx
      Chat.jsx
      Profile.jsx
    components/
      layout/
        Sidebar.jsx
        ChatWindow.jsx
        RightPanel.jsx
      chat/
        ChatHeader.jsx
        MessageList.jsx
        MessageInput.jsx
      friends/
        FriendRequests.jsx
      groups/
        GroupList.jsx
    services/
      api.js
      auth.js
      websocket.js
```

## Database Schema (Models)
- User: `id`, `username`, `email`, `hashed_password`, `display_name`, `unique_id`, `created_at`
- FriendRequest: `id`, `from_user_id`, `to_user_id`, `status`, `created_at`
- Friendship: `id`, `user_id`, `friend_id`, `created_at`
- Chat: `id`, `type`, `name`, `invite_code`, `owner_id`, `user_a_id`, `user_b_id`, `created_at`
- GroupMember: `id`, `chat_id`, `user_id`, `role`, `joined_at`
- Message: `id`, `chat_id`, `sender_id`, `content`, `created_at`

## API Endpoints
- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Users
  - `GET /api/users/me`
  - `GET /api/users/search?query=...`
- Friends
  - `POST /api/friends/requests`
  - `GET /api/friends/requests`
  - `POST /api/friends/requests/{request_id}/accept`
  - `POST /api/friends/requests/{request_id}/reject`
  - `GET /api/friends/list`
- Chats
  - `POST /api/chats/`
  - `GET /api/chats/`
- Groups
  - `POST /api/groups/`
  - `POST /api/groups/join`
- Messages
  - `POST /api/messages/`
  - `GET /api/messages/chat/{chat_id}`
- Profile
  - `GET /api/profile/`
  - `PUT /api/profile/`

## WebSocket Structure
- `GET ws://<backend-host>/ws/chat/{chat_id}?token=JWT`
- Connection manager stores active sockets by `chat_id`.
- Broadcasts JSON messages to all active members of a chat.

## Build Plan
1. Set up backend with FastAPI, SQLAlchemy, and JWT utilities.
2. Define database models and Pydantic schemas.
3. Implement REST endpoints for auth, friends, chats, groups, and messages.
4. Add WebSocket connection manager for real-time delivery.
5. Build React UI with auth pages and main chat layout.
6. Add protected routes, API helper, and WebSocket client helper.
7. Configure environment variables for API and WebSocket URLs.
8. Test REST endpoints and WebSocket messaging flow.
9. Prepare deployment configs for Render and Vercel.

## Local Development
- Backend:
  - Create a virtual environment.
  - Install dependencies from `backend/requirements.txt`.
  - Copy `backend/.env.example` to `.env` and update values.
  - Run `uvicorn app.main:app --reload` inside `backend`.
- Frontend:
  - Install dependencies from `frontend/package.json`.
  - Copy `frontend/.env.example` to `.env` and update values.
  - Run `npm run dev` inside `frontend`.

## Deployment Notes
- Backend on Render:
  - Use a PostgreSQL instance and set `DATABASE_URL` in environment variables.
  - Set `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, and `CORS_ORIGINS`.
  - Use the start command `uvicorn app.main:app --host 0.0.0.0 --port 10000`.
- Frontend on Vercel:
  - Set `VITE_API_URL` and `VITE_WS_URL` environment variables.
  - Build command: `npm run build`.
  - Output directory: `dist`.
