import { kv } from "./kv";

const WINDOW_SECONDS = 600; // 10 minutos
const MAX_ATTEMPTS = 5;

export async function checkRateLimit(bucket: string, identifier: string): Promise<boolean> {
  const key = `ratelimit:${bucket}:${identifier}`;
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, WINDOW_SECONDS);
  }
  return count <= MAX_ATTEMPTS;
}
