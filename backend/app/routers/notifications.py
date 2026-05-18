from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.core.websocket import manager
from app.routers.dependencies import get_current_user_ws
from app.models.user import User

router = APIRouter(prefix="/ws", tags=["notifications"])

@router.websocket("/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    user: User = Depends(get_current_user_ws)
):
    await manager.connect(websocket, user.id)
    try:
        while True:
            # We don't expect client messages for now, but need to keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
