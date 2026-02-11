from collections import defaultdict
from typing import DefaultDict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from jose import JWTError

from app.core.security import decode_access_token

websocket_router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.active_by_chat: DefaultDict[int, Set[WebSocket]] = defaultdict(set)

    async def connect(self, chat_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_by_chat[chat_id].add(websocket)

    def disconnect(self, chat_id: int, websocket: WebSocket) -> None:
        self.active_by_chat[chat_id].discard(websocket)

    async def broadcast(self, chat_id: int, message: dict) -> None:
        for connection in list(self.active_by_chat[chat_id]):
            await connection.send_json(message)


manager = ConnectionManager()


def normalize_token(token: str) -> str:
    if not token:
        return ""
    if token.lower().startswith("bearer "):
        return token.split(" ", 1)[1].strip()
    return token.strip()


def validate_token(token: str) -> bool:
    try:
        payload = decode_access_token(normalize_token(token))
        return bool(payload.get("sub"))
    except JWTError:
        return False


@websocket_router.websocket("/ws/chat/{chat_id}")
async def chat_socket(websocket: WebSocket, chat_id: int, token: str = "") -> None:
    token_value = token or websocket.headers.get("authorization", "")
    if not validate_token(token_value):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(chat_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(chat_id, data)
    except WebSocketDisconnect:
        manager.disconnect(chat_id, websocket)
