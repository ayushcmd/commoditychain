"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Commodity } from "@/types";
import { api } from "@/lib/api";
import { POLL_INTERVAL_MS, WS_BASE_URL, WS_RECONNECT_DELAY_MS } from "@/lib/constants";

interface UsePricesReturn {
  commodities: Commodity[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isConnected: boolean;
  refresh: () => void;
}

export function usePrices(): UsePricesReturn {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const data = await api.getPrices();
      setCommodities(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Failed to fetch prices. Retrying...");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/prices`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        if (reconnectRef.current) clearTimeout(reconnectRef.current);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          // Ignore keepalive ping messages
          if (!Array.isArray(parsed)) return;
          setCommodities(parsed as Commodity[]);
          setLastUpdated(new Date());
        } catch {
          console.warn("WS parse error", event.data);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectRef.current = setTimeout(connectWS, WS_RECONNECT_DELAY_MS);
      };
    } catch {
      setIsConnected(false);
      reconnectRef.current = setTimeout(connectWS, WS_RECONNECT_DELAY_MS);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    connectWS();

    pollRef.current = setInterval(fetchPrices, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [fetchPrices, connectWS]);

  return {
    commodities,
    loading,
    error,
    lastUpdated,
    isConnected,
    refresh: fetchPrices,
  };
}