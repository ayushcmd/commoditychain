"use client";

import { useState, useEffect, useCallback } from "react";
import { WatchlistItem } from "@/types";

const KEY = "cc-watchlist";

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (next: WatchlistItem[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = useCallback((commodityId: string, buyPrice: number, quantity: number) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.commodityId !== commodityId);
      const next = [...filtered, { commodityId, buyPrice, quantity, addedAt: new Date().toISOString() }];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((commodityId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.commodityId !== commodityId);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const has = useCallback((commodityId: string) => items.some((i) => i.commodityId === commodityId), [items]);
  const get = useCallback((commodityId: string) => items.find((i) => i.commodityId === commodityId), [items]);

  return { items, add, remove, has, get };
}
