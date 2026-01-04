import { Redis } from "@upstash/redis";
import { Game } from "./types";

// In-memory fallback for local development or when Redis is not configured
const memoryStore = new Map<string, Game>();

const isRedisConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let redis: Redis | null = null;
if (isRedisConfigured) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
}

export const gameStore = {
    get: async (code: string): Promise<Game | undefined> => {
        if (redis) {
            const game = await redis.get<Game>(`game:${code}`);
            return game || undefined;
        }
        return memoryStore.get(code);
    },
    set: async (code: string, game: Game): Promise<void> => {
        if (redis) {
            // Expire games after 24 hours to clean up
            await redis.set(`game:${code}`, game, { ex: 86400 });
        } else {
            memoryStore.set(code, game);
        }
    },
    has: async (code: string): Promise<boolean> => {
        if (redis) {
            const exists = await redis.exists(`game:${code}`);
            return exists === 1;
        }
        return memoryStore.has(code);
    },
    delete: async (code: string): Promise<void> => {
        if (redis) {
            await redis.del(`game:${code}`);
        } else {
            memoryStore.delete(code);
        }
    },
};
