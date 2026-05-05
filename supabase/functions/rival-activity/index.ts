import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type RivalActivityPayload = {
  event_type?: "workout_logged" | "post_created" | string;
  actor_sub_id?: string;
  record?: Record<string, unknown>;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const APNS_TEAM_ID = Deno.env.get("APNS_TEAM_ID") ?? "";
const APNS_KEY_ID = Deno.env.get("APNS_KEY_ID") ?? "";
const APNS_BUNDLE_ID = Deno.env.get("APNS_BUNDLE_ID") ?? "";
const APNS_PRIVATE_KEY = (Deno.env.get("APNS_PRIVATE_KEY") ?? "").replace(/\\n/g, "\n");
const APNS_USE_SANDBOX = (Deno.env.get("APNS_USE_SANDBOX") ?? "true").toLowerCase() === "true";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function toBase64Url(input: string | ArrayBuffer): string {
  let bytes: Uint8Array;
  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const raw = atob(cleaned);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out.buffer;
}

async function createApnsJwt(): Promise<string> {
  const header = { alg: "ES256", kid: APNS_KEY_ID, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: APNS_TEAM_ID, iat: now };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(APNS_PRIVATE_KEY),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${toBase64Url(signature)}`;
}

function buildMessage(eventType: string): string {
  if (eventType === "workout_logged") return "Your rival just logged a workout 💪";
  if (eventType === "post_created") return "Your rival just made a post 📸";
  return "Your rival has new activity";
}

async function sendApnsPush(token: string, body: string, apnsJwt: string) {
  const host = APNS_USE_SANDBOX ? "https://api.sandbox.push.apple.com" : "https://api.push.apple.com";
  const url = `${host}/3/device/${token}`;

  const payload = {
    aps: {
      alert: { title: "MeatHead Rival Activity", body },
      sound: "default",
    },
    type: "rival_activity",
  };

  return fetch(url, {
    method: "POST",
    headers: {
      authorization: `bearer ${apnsJwt}`,
      "apns-topic": APNS_BUNDLE_ID,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase service credentials" }), { status: 500 });
  }
  if (!APNS_TEAM_ID || !APNS_KEY_ID || !APNS_BUNDLE_ID || !APNS_PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: "Missing APNs env vars" }), { status: 500 });
  }

  const payload = (await req.json()) as RivalActivityPayload;
  const eventType = payload.event_type ?? "unknown";
  const actorSubId = payload.actor_sub_id;
  if (!actorSubId) {
    return new Response(JSON.stringify({ error: "Missing actor_sub_id" }), { status: 400 });
  }

  const { data: rivals, error: rivalsError } = await supabase
    .from("users_nemesis")
    .select("user_sub_id")
    .eq("nemesis_sub_id", actorSubId);

  if (rivalsError) {
    return new Response(JSON.stringify({ error: "Failed to lookup rivals", details: rivalsError.message }), {
      status: 500,
    });
  }

  const recipientSubIds = [...new Set((rivals ?? []).map((r) => r.user_sub_id).filter(Boolean))];
  if (recipientSubIds.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0, reason: "No rivals for actor" }), { status: 200 });
  }

  const { data: tokensData, error: tokensError } = await supabase
    .from("user_push_tokens")
    .select("apns_token, user_sub_id")
    .in("user_sub_id", recipientSubIds)
    .eq("platform", "ios");

  if (tokensError) {
    return new Response(JSON.stringify({ error: "Failed to fetch push tokens", details: tokensError.message }), {
      status: 500,
    });
  }

  const tokens = [...new Set((tokensData ?? []).map((t) => t.apns_token).filter(Boolean))];
  if (tokens.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0, reason: "No push tokens found" }), { status: 200 });
  }

  const message = buildMessage(eventType);
  const apnsJwt = await createApnsJwt();

  const results = await Promise.all(
    tokens.map(async (token) => {
      const response = await sendApnsPush(token, message, apnsJwt);
      return { token, ok: response.ok, status: response.status };
    }),
  );

  const sent = results.filter((r) => r.ok).length;
  return new Response(JSON.stringify({ ok: true, eventType, actorSubId, recipients: recipientSubIds.length, sent, results }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
