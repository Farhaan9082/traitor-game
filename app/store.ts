import { Game } from "./types";

// Global variable to store games in memory
// In a real production app, this should be Redis or a database
// But for this MVP, a global variable is sufficient as long as server doesn't restart
const games = new Map<string, Game>();

export const gameStore = {
    get: (code: string) => games.get(code),
    set: (code: string, game: Game) => games.set(code, game),
    has: (code: string) => games.has(code),
    delete: (code: string) => games.delete(code),
};
