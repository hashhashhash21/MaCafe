import { NextResponse } from "next/server";
import { getAnamConfig } from "@/lib/anam-config";
import { secret } from "@/lib/cloudflare";

const itemIds = ["hot_spanish_latte", "iced_spanish_latte", "cappuccino", "americano", "latte", "hot_chocolate", "mocha", "espresso", "green_tea", "black_tea", "caramel_macchiato", "white_mocha", "caramel_frappe", "mocha_frappe", "vanilla_oreo_frappe", "chocolate_oreo_frappe", "strawberry_banana_smoothie", "mango_smoothie", "iced_americano", "iced_latte", "iced_mocha", "iced_caramel_macchiato", "iced_white_mocha", "chocolate_mcbites", "double_chocolate_cookie", "triple_chocolate_cookie", "brown_tumbler"];

const tools = [
  { type: "client", name: "show_signature_menu", description: "Show McCafé signature drinks and recommendations on screen.", parameters: { type: "object", properties: {} }, awaitResult: true },
  { type: "client", name: "filter_coffee_menu", description: "Navigate the visible menu to a requested category.", parameters: { type: "object", properties: { category: { type: "string", enum: ["bucket", "all", "hot", "cold", "treats", "tumblers"] } }, required: ["category"] }, awaitResult: true },
  { type: "client", name: "show_item_details", description: "Show a specific item on screen when describing or recommending it.", parameters: { type: "object", properties: { itemId: { type: "string", enum: itemIds } }, required: ["itemId"] }, awaitResult: true },
  { type: "client", name: "select_coffee_item", description: "Add a drink or bakery item to the customer's order.", parameters: { type: "object", properties: { itemId: { type: "string", enum: itemIds }, quantity: { type: "number" }, size: { type: "string", enum: ["regular", "large", "double"] }, milk: { type: "string", enum: ["regular", "oat", "almond", "none"] } }, required: ["itemId"] }, awaitResult: true },
  { type: "client", name: "remove_coffee_item", description: "Remove or reduce an item in the customer's order.", parameters: { type: "object", properties: { itemId: { type: "string", enum: itemIds }, quantity: { type: "number" } }, required: ["itemId"] }, awaitResult: true },
  { type: "client", name: "show_order_confirmation", description: "Open the order review when the customer wants to finish or check out.", parameters: { type: "object", properties: {} }, awaitResult: true },
  { type: "client", name: "close_order_confirmation", description: "Close order review and continue browsing.", parameters: { type: "object", properties: {} }, awaitResult: true },
  { type: "client", name: "confirm_and_generate_token", description: "Confirm the order and generate its pickup token after explicit customer approval.", parameters: { type: "object", properties: { confirmed: { type: "boolean" } }, required: ["confirmed"] }, awaitResult: true },
  { type: "client", name: "reset_order", description: "Clear the order when the customer explicitly asks to start over.", parameters: { type: "object", properties: {} }, awaitResult: true },
];

export async function POST() {
  const runtime = await getAnamConfig();
  const apiKey = runtime.apiKey;
  if (!apiKey) return NextResponse.json({ error: "Live avatar is not configured yet." }, { status: 503 });

  const personaConfig = {
    personaId: "",
    name: runtime.baristaName,
    avatarId: runtime.avatarId,
    avatarModel: "cara-4",
    voiceId: runtime.voiceId,
    llmId: runtime.llmId,
    languageCode: "ar",
    initialMessage: secret('ANAM_INITIAL_MESSAGE') || "يا هلا والله ومسهلا فيك بـ McCafé! وش تحب نجهّز لك اليوم؟",
    tools,
    systemPrompt: `You are مرام (Maram), the live virtual McCafé counter barista in Riyadh, Saudi Arabia. Start and remain in natural Saudi Arabic unless the customer explicitly asks for English. Be warm, concise, and conversational. Only offer items from this menu: Hot Spanish Latte SAR 14; Iced Spanish Latte SAR 15; Cappuccino SAR 10; Americano SAR 10; Latte SAR 10; Hot Chocolate SAR 13; Mocha SAR 13; Espresso SAR 7; Premium Dilmah Green Tea SAR 7; Premium Dilmah Black Tea SAR 7; Caramel Macchiato SAR 14; White Mocha SAR 14; Caramel Frappe SAR 16; Mocha Frappe SAR 16; Vanilla Oreo Frappe SAR 18; Chocolate Oreo Frappe SAR 18; Strawberry Banana Smoothie SAR 20; Mango Smoothie SAR 20; Iced Americano SAR 10; Iced Latte SAR 12; Iced Mocha SAR 15; Iced Caramel Macchiato SAR 16; Iced White Mocha SAR 16; Chocolate McBites SAR 9; Double Chocolate Cookie SAR 10; Triple Chocolate Cookie SAR 10; Brown Tumbler SAR 40. Use the client tools whenever your response should change the visible menu or order. Never claim an item was added, removed, reviewed, or confirmed without calling the matching tool. Supported verified variants: Hot Spanish Latte regular 14/large 16; Cappuccino 10/12; Latte 10/12; Hot Chocolate 13/15; Mocha 13/15; Caramel Macchiato 14/16; White Mocha 14/16; Espresso single 7/double 10. If a requested large/double variant is unavailable, use regular and tell the customer. Milk preference is recorded without an added price unless configured later. Prices shown include Saudi VAT; the UI calculates the included 15% VAT portion. Ask for explicit confirmation before confirm_and_generate_token. Menu IDs: ${itemIds.join(", ")}.`,
  };

  try {
    const response = await fetch("https://api.anam.ai/v1/auth/session-token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ clientLabel: "marams-cafe-cloudflare-v27", personaConfig }),
    });
    if (!response.ok) {
      console.error("Anam session error", response.status, await response.text());
      const safe = response.status === 401 ? "Anam rejected the API key." : response.status === 403 ? "Anam rejected access to this avatar or model." : response.status === 429 ? "Anam usage or concurrency limit reached." : "Could not start the live barista.";
      return NextResponse.json({ error: safe, code: `ANAM_${response.status}` }, { status: response.status });
    }
    const data = await response.json() as { sessionToken: string };
    return NextResponse.json({ sessionToken: data.sessionToken });
  } catch (error) {
    console.error("Anam request failed", error);
    return NextResponse.json({ error: "Could not reach the avatar service." }, { status: 502 });
  }
}
