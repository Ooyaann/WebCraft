import type { AuthUser } from "@/lib/auth";
import { HttpError } from "@/lib/http";

// Port dari backend/app/rate_limit.py — limiter fixed-window in-memory.
// ponytail: berlaku per warm serverless instance, bukan global; ganti ke
// Upstash Redis / counter DB kalau butuh limit lintas-instance yang ketat.

const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function enforceLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
  message: string,
): void {
  const now = Date.now() / 1000;
  const cutoff = now - windowSeconds;
  const list = (hits.get(key) ?? []).filter((t) => t >= cutoff);

  if (list.length >= maxRequests) {
    const retryAfter = Math.trunc(windowSeconds - (now - list[0])) + 1;
    throw new HttpError(429, message, { "Retry-After": String(retryAfter) });
  }

  list.push(now);
  hits.set(key, list);
}

// 20 panggilan AI per menit per user cukup longgar untuk tutoring interaktif
// tapi memblokir abuse terskrip atas kuota Gemini.
export function enforceAiRateLimit(req: Request, user: AuthUser | null): void {
  const key = user ? `ai:user:${user.id}` : `ai:ip:${clientIp(req)}`;
  enforceLimit(
    key,
    20,
    60,
    "Terlalu banyak permintaan ke layanan AI. Silakan tunggu sebentar lalu coba lagi.",
  );
}

// Rem brute-force pada login/register: 10 percobaan per menit per IP.
export function enforceAuthRateLimit(req: Request): void {
  enforceLimit(
    `auth:ip:${clientIp(req)}`,
    10,
    60,
    "Terlalu banyak percobaan masuk. Silakan tunggu sebentar lalu coba lagi.",
  );
}
