import { useEffect, useRef, useState } from "react";
import type { WsFrame } from "@nimbus/shared-types";
import { getToken } from "./api";

type FrameHandler = (frame: WsFrame) => void;
type StatusHandler = (connected: boolean) => void;

/**
 * Менеджер WebSocket-соединения: установка соединения,
 * автоматический reconnect с экспоненциальной задержкой (до 30 с),
 * корректное завершение без утечек таймеров и сокетов.
 */
export class RealtimeClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempt = 0;
  private stopped = false;

  constructor(
    private readonly onFrame: FrameHandler,
    private readonly onStatus: StatusHandler,
  ) {}

  connect(): void {
    if (this.stopped) return;
    const tok = getToken();
    if (!tok) return;
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsBase = (import.meta.env.VITE_WS_URL as string | undefined) ?? `${proto}//${window.location.host}/ws`;
    const url = `${wsBase}?token=${encodeURIComponent(tok)}`;
    const ws = new WebSocket(url, "nimbus-v1");
    this.socket = ws;
    ws.onopen = () => {
      this.onStatus(true);
      this.attempt = 0;
    };
    ws.onmessage = (ev) => {
      try {
        this.onFrame(JSON.parse(ev.data) as WsFrame);
      } catch {
        /* noop */
      }
    };
    ws.onclose = () => {
      this.onStatus(false);
      this.scheduleReconnect();
    };
    ws.onerror = () => {
      ws.close();
    };
  }

  disconnect(): void {
    this.stopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  private scheduleReconnect(): void {
    if (this.stopped) return;
    this.attempt = Math.min(this.attempt + 1, 6);
    const wait = Math.min(1000 * 2 ** this.attempt, 30_000);
    this.reconnectTimer = setTimeout(() => this.connect(), wait);
  }
}

/** Тонкая React-обёртка над RealtimeClient: жизненный цикл соединения привязан к компоненту. */
export function useRealtime(onFrame: FrameHandler) {
  const clientRef = useRef<RealtimeClient | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const client = new RealtimeClient(onFrame, setConnected);
    clientRef.current = client;
    client.connect();
    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [onFrame]);

  return { connected };
}
