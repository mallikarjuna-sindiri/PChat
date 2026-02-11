const resolveWsUrl = () => {
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs) return envWs;

  const envApi = import.meta.env.VITE_API_URL;
  if (envApi) {
    const apiUrl = new URL(envApi);
    apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
    return apiUrl.origin;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.hostname}:8000`;
};

export const createChatSocket = ({ chatId, token, onMessage, onStatus }) => {
  const wsUrl = resolveWsUrl();
  const params = new URLSearchParams({ token: token || "" });
  const socket = new WebSocket(`${wsUrl}/ws/chat/${chatId}?${params.toString()}`);

  socket.onopen = () => onStatus?.("connected");
  socket.onclose = () => onStatus?.("disconnected");
  socket.onerror = () => onStatus?.("error");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage?.(data);
  };

  return socket;
};
