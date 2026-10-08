# Priority Bags phone assistant (Vapi)

Calls to **+91 74004 59254** (MyOperator) are forwarded to a Vapi assistant.
Vapi turns speech into text, Claude decides the answer, and Vapi speaks it back.
When the assistant needs live facts it calls the website backend:

```
POST https://ecommercewebsite-5z8k.onrender.com/api/voice/vapi
```

The backend checks the shared secret (`VAPI_WEBHOOK_SECRET` on Render), answers
tool calls and saves every call's transcript and summary to the admin
**Chat Logs** (intent `phone_call`).

---

## 1. Create the assistant (Vapi dashboard → Assistants → Create)

| Setting | Value |
|---|---|
| Name | `Priority Bags Support` |
| Model provider | Anthropic |
| Model | Claude Haiku 4.5 (fast enough for live calls) |
| Transcriber | Deepgram, model `nova-3`, language `multi` (English + Hindi) |
| Voice | Any Indian-English voice you like (test a few in the dashboard) |
| First message | `Namaste, thank you for calling Priority Bags. I'm the Priority Bags AI assistant, and this call may be recorded. How can I help you today?` |
| Recording | On |

### System prompt (paste into the model's system prompt)

```
You are the phone assistant for Priority Bags (prioritybags.in) and its premium
travel line TRAWORLD, made by High Spirit Commercial Ventures Pvt. Ltd. You are
speaking on a phone call, so:

- Keep every answer to one to three short sentences. No lists, no symbols, no links read aloud.
- Speak simple English. If the caller speaks Hindi or Hinglish, reply in the same language.
- Say prices as "one thousand four hundred and ninety nine rupees", not digits.
- Never make up product names, prices, policies or delivery dates. If you do not know, say so
  and offer to take a message for the team.

WHAT YOU CAN HELP WITH
- Product questions and recommendations: ALWAYS call search_products first and only mention
  products it returns. Mention at most two, with price and where to buy.
- Where to buy: products are sold on Amazon, Flipkart, Myntra and Ajio (the store the product
  is "available_on"), and the "Buy" buttons on prioritybags.in link to them.
- School bag sizing by age: under 3 years 14 inch, 3 to 5 years 14 to 15 inch, 6 to 10 years
  16 to 17 inch, 11 years and above 18 inch or larger.
- Bulk and corporate orders: ask for company name, quantity and city, then create a support
  ticket so the corporate team calls back. They can also use the Bulk/Corporate Orders page.
- Ticket status: ask for the ticket number (like C S dash 2026 1008 dash 6 C 4 B A D) and call
  check_ticket_status. Read the status in plain words.

ORDERS, DAMAGE, REFUNDS, COMPLAINTS
- Marketplace orders (tracking, cancellation, return, refund) are handled in "Your Orders" on
  the marketplace where the caller bought it. Explain this kindly.
- Damaged or defective bags, replacement requests, refunds, angry callers or anything you are
  unsure about: do NOT promise a replacement, refund or timeline. Collect the caller's name,
  the product, where and roughly when they bought it, and a short description, ask for an
  email address if they are happy to share it, then call create_support_ticket and read the
  ticket number back slowly. Tell them the team will contact them.
- If the caller asks for a person, transfer the call (or, if transfer is unavailable, create a
  support ticket for a call-back).

Before ending, ask if there is anything else, then thank them for calling Priority Bags.
```

> Check the facts above (sizes, marketplaces, corporate process) and add your warranty and
> return rules before going live. The assistant will repeat whatever this prompt says.

---

## 2. Connect the assistant to the backend

Assistant → **Advanced → Server**:

- **Server URL:** `https://ecommercewebsite-5z8k.onrender.com/api/voice/vapi`
- **Secret / credential:** the same value as `VAPI_WEBHOOK_SECRET` on Render
  (sent as `X-Vapi-Secret`, or as a Bearer token credential; the backend accepts both).
- **Server messages:** `tool-calls`, `end-of-call-report`.

## 3. Add the tools (Vapi dashboard → Tools → Create Tool → Function)

Use the same Server URL and secret for each tool, then attach all three to the assistant.

**search_products**
```json
{
  "name": "search_products",
  "description": "Search the Priority Bags / TRAWORLD catalogue. Use before recommending or quoting any product or price.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Keywords, e.g. 'laptop backpack', 'trolley', 'school bag 6 year old', 'spiderman'" },
      "category": { "type": "string", "description": "Optional category slug: school-backpacks, college-backpacks, laptop-backpacks, trekking-backpacks, luggage, duffle, junior, accessories, premium" },
      "min_price": { "type": "number", "description": "Minimum price in rupees" },
      "max_price": { "type": "number", "description": "Maximum price in rupees" }
    }
  }
}
```

**check_ticket_status**
```json
{
  "name": "check_ticket_status",
  "description": "Look up a support ticket the caller already has, by its ticket number (e.g. CS-20261008-6C4BAD or WR-...).",
  "parameters": {
    "type": "object",
    "properties": {
      "ticket_number": { "type": "string", "description": "The ticket number, letters and digits as spoken" }
    },
    "required": ["ticket_number"]
  }
}
```

**create_support_ticket**
```json
{
  "name": "create_support_ticket",
  "description": "Create a support ticket for damage, warranty, replacement, refund, complaint, corporate/bulk enquiry or call-back requests. The caller's phone number is added automatically.",
  "parameters": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Caller's name" },
      "issue_summary": { "type": "string", "description": "One or two sentences: what happened, product, where and when bought" },
      "product_name": { "type": "string", "description": "Product or model name if known" },
      "email": { "type": "string", "description": "Caller's email, only if they shared it" }
    },
    "required": ["name", "issue_summary"]
  }
}
```

**Transfer to a person (optional):** add Vapi's built-in *Transfer Call* tool with your staff
number as the destination. Use a number that is **not** +91 74004 59254, or the call will loop
back to the assistant.

---

## 4. Test before connecting the phone line

1. Vapi dashboard → the assistant → **Talk to Assistant** (web call).
2. Ask: "Which laptop bag do you have under 2000 rupees?" (should call search_products).
3. Say: "My school bag zip broke, I want a replacement" (should collect details and read a ticket number).
4. Check the admin panel: the new ticket under Support, and the call under Chat Logs.

## 5. Connect +91 74004 59254 (MyOperator)

MyOperator must forward incoming calls to the assistant. Ask MyOperator support for one of:

- **SIP forwarding (preferred):** forward calls to the assistant's SIP address
  (Vapi → Phone Numbers → Create → SIP, e.g. `sip:prioritybags@sip.vapi.ai`), and confirm they
  support SIP REFER so the assistant can transfer calls back to staff.
- **Number forwarding (fallback):** forward to a phone number that is attached to the assistant
  in Vapi (for an Indian number, via a carrier Vapi supports, such as Plivo).

## Notes

- Render's free plan sleeps when idle; the first tool call after a quiet period can take
  ~30 seconds and Vapi gives up after 20. Use a paid Render instance (or a keep-alive ping)
  before going live.
- Tickets created by phone have the caller's number in **phone**; email is blank unless the
  caller gave one.
