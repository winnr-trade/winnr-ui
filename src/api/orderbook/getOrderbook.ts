import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

export type OrderbookItem = [number, number]; // [price, size]
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
      `ws://localhost:12346/modules/orderbook/ws?market_id=${marketId}`,
    );

    ws.addEventListener("open", () => {
      setIsConnected(true);
    });

    ws.addEventListener("close", () => {
      setIsConnected(false);
    });

    ws.addEventListener("message", (event) => {
      // console.log("Message received", event);

      try {
        const data = JSON.parse(event.data);
        // console.log("Orderbook message", data);

        if (data.yes_bids && data.yes_asks) {
          setOrderbook({
            bids: data.yes_bids.map((bid: [number, number]) => [bid[0] / 100, bid[1]]),
            asks: data.yes_asks.map((ask: [number, number]) => [ask[0] / 100, ask[1]]),
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
