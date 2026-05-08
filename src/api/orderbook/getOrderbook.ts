import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { rollupWsUrl } from "@/config/env";
import { priceBasisToUnits } from "@/utils";

export type OrderbookItem = [bigint, number]; // [price, size]
export type OrderbookData = {
  bids: OrderbookItem[];
  asks: OrderbookItem[];
};

export function useOrderbook(params: { marketId: number }) {
  const { marketId } = params;
  const [orderbook, setOrderbook] = useState<OrderbookData>({ bids: [], asks: [] });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(marketId)) return;

    const ws = new ReconnectingWebSocket(
      `${rollupWsUrl}/modules/orderbook/ws?market_id=${marketId}`,
    );

    ws.addEventListener("open", () => {
      setIsConnected(true);
    });

    ws.addEventListener("close", () => {
      setIsConnected(false);
    });

    ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.yes_bids && data.yes_asks) {
          setOrderbook({
            bids: data.yes_bids.map((bid: [number, number]) => [
              priceBasisToUnits(bid[0], 6),
              bid[1],
            ]),
            asks: data.yes_asks.map((ask: [number, number]) => [
              priceBasisToUnits(ask[0], 6),
              ask[1],
            ]),
          });
        }
      } catch (err) {
        console.error("Failed to parse orderbook message", err);
      }
    });

    return () => {
      ws.close();
    };
  }, [marketId]);

  return { ...orderbook, isConnected };
}
