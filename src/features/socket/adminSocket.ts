let ws: WebSocket | null = null;
import { WEBSOCKET_BACKEND_URL } from "../../config/apiConfig";
export function connectAdminSocket(onMessage?: (event: MessageEvent) => void) {
  if (ws) ws.close();
  const token = localStorage.getItem("ptit_access_token");
  const wsUrl = token ? `${WEBSOCKET_BACKEND_URL}?token=${token}` : WEBSOCKET_BACKEND_URL;
  ws = new window.WebSocket(wsUrl);
  ws.onopen = () => {
    console.log("WebSocket connected");
  };
  ws.onclose = () => {
    console.log("WebSocket disconnected");
  };
  ws.onerror = (e) => {
    console.error("WebSocket error", e);
  };
  if (onMessage) ws.onmessage = onMessage;
  return ws;
}

export function disconnectAdminSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function getAdminSocket() {
  return ws;
}
