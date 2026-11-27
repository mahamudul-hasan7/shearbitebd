import { apiError, requireAuth } from "@/lib/api";
import { subscribeRescueEvents } from "@/lib/realtime/rescue-events";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        };

        send("connected", { at: new Date().toISOString() });

        const unsubscribe = subscribeRescueEvents((payload) => {
          send("rescue", payload);
        });

        const heartbeat = setInterval(() => {
          send("ping", { at: Date.now() });
        }, 25_000);

        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          unsubscribe();
          try {
            controller.close();
          } catch {
            // Stream already closed.
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
