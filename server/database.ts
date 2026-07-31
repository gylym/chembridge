import { env } from "cloudflare:workers";
import { ApiError } from "./http";

export function getD1() {
  const workerEnv = env as unknown as { DB?: D1Database };
  if (!workerEnv.DB) {
    throw new ApiError(503, "DATABASE_UNAVAILABLE", "Деректер қоймасы қолжетімсіз");
  }
  return workerEnv.DB;
}

export function getMediaBucket() {
  const workerEnv = env as unknown as { MEDIA?: R2Bucket };
  if (!workerEnv.MEDIA) {
    throw new ApiError(503, "MEDIA_UNAVAILABLE", "Медиа қоймасы қолжетімсіз");
  }
  return workerEnv.MEDIA;
}
