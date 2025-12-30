"use server";

import { gameStore } from "./store";
import { Game, Player, Role } from "./types";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

// Helper to generate a 6-digit code
function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to generate a secure random ID
function generateId(): string {
    return randomBytes(16).toString("hex");
}

export async function createGame(hostName: string) {
    const code = generateCode();
    const hostId = generateId();

    const newGame: Game = {
        code,
        status: "waiting",
        players: [
            {
                id: hostId,
                name: hostName,
                role: "innocent", // Temporary role, will be assigned on start
                roleSeen: false,
            },
        ],
        createdAt: Date.now(),
    };

    gameStore.set(code, newGame);

    // Return the code and hostId so the client can store them
    return { success: true, code, playerId: hostId };
}

export async function joinGame(code: string, playerName: string) {
    const game = gameStore.get(code);

    if (!game) {
        return { success: false, error: "Game not found" };
    }

    if (game.status !== "waiting") {
        return { success: false, error: "Game already started" };
    }

    const playerId = generateId();
    const newPlayer: Player = {
        id: playerId,
        name: playerName,
        role: "innocent", // Temporary role
        roleSeen: false,
    };

    game.players.push(newPlayer);
    gameStore.set(code, game);

    return { success: true, code, playerId };
}

export async function getGameStatus(code: string) {
    const game = gameStore.get(code);

    if (!game) {
        return { success: false, error: "Game not found" };
    }

    // Sanitize: Don't send roles to the client
    const sanitizedPlayers = game.players.map((p) => ({
        id: p.id,
        name: p.name,
        roleSeen: p.roleSeen,
        // role is intentionally omitted
    }));

    return {
        success: true,
        game: {
            code: game.code,
            status: game.status,
            players: sanitizedPlayers,
        },
    };
}

export async function startGame(code: string) {
    const game = gameStore.get(code);

    if (!game) {
        return { success: false, error: "Game not found" };
    }

    if (game.players.length < 3) {
        return { success: false, error: "Need at least 3 players to start" };
    }

    // Shuffle players
    const shuffled = [...game.players].sort(() => Math.random() - 0.5);

    // Assign roles: 1 Traitor, 1 Host (if different logic needed, but spec says "1 Host" role), rest Innocent
    // Wait, spec says: "Assign: 1 Traitor, 1 Host, Remaining Innocents"
    // But "Host" is usually the person who created the game. 
    // Clarification from spec: "Host must never see player roles". 
    // "Host" role implies a specific role in the game, distinct from the person who created the lobby.
    // Let's assume "Host" is a role like "Narrator" or "God" who manages the game but doesn't play as innocent/traitor?
    // Or is it just a role card? 
    // Spec: "Host role is private like any other role". 
    // So it's a role assigned randomly.

    // Assign roles
    shuffled[0].role = "traitor";
    shuffled[1].role = "host";
    for (let i = 2; i < shuffled.length; i++) {
        shuffled[i].role = "innocent";
    }

    // Update game state
    // We need to map the shuffled roles back to the original players array or just replace it
    // Since we have references, modifying objects in 'shuffled' modifies them in 'game.players' if they are same objects
    // But let's be safe and re-assign
    game.players = shuffled;
    game.status = "started";

    gameStore.set(code, game);

    return { success: true };
}

export async function getRole(code: string, playerId: string) {
    const game = gameStore.get(code);

    if (!game) {
        return { success: false, error: "Game not found" };
    }

    const player = game.players.find((p) => p.id === playerId);

    if (!player) {
        return { success: false, error: "Player not found" };
    }

    if (player.roleSeen) {
        return { success: false, error: "Role already revealed" };
    }

    // Mark as seen
    player.roleSeen = true;
    gameStore.set(code, game);

    return { success: true, role: player.role };
}
