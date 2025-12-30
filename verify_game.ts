import { createGame, joinGame, startGame, getRole, getGameStatus } from "./app/actions";

async function runVerification() {
    console.log("Starting verification...");

    // 1. Create Game
    console.log("1. Creating Game...");
    const host = await createGame("Host");
    if (!host.success || !host.code) throw new Error("Failed to create game");
    console.log(`   Game created with code: ${host.code}`);

    // 2. Join Game
    console.log("2. Joining Players...");
    const p2 = await joinGame(host.code, "Player 2");
    const p3 = await joinGame(host.code, "Player 3");
    if (!p2.success || !p3.success) throw new Error("Failed to join game");
    console.log("   Players joined successfully");

    // 3. Check Lobby
    console.log("3. Checking Lobby...");
    const status = await getGameStatus(host.code);
    if (status.game?.players.length !== 3) throw new Error("Incorrect player count");
    console.log("   Lobby has 3 players");

    // 4. Start Game
    console.log("4. Starting Game...");
    const start = await startGame(host.code);
    if (!start.success) throw new Error("Failed to start game");
    console.log("   Game started");

    // 5. Reveal Roles
    console.log("5. Revealing Roles...");
    const r1 = await getRole(host.code, host.playerId!);
    const r2 = await getRole(host.code, p2.playerId!);
    const r3 = await getRole(host.code, p3.playerId!);

    console.log(`   Host Role: ${r1.role}`);
    console.log(`   P2 Role: ${r2.role}`);
    console.log(`   P3 Role: ${r3.role}`);

    const roles = [r1.role, r2.role, r3.role];
    if (!roles.includes("traitor") || !roles.includes("host") || !roles.includes("innocent")) {
        throw new Error("Invalid role distribution");
    }
    console.log("   Roles distributed correctly");

    // 6. Verify Security (One-time reveal)
    console.log("6. Verifying Security...");
    const r1_again = await getRole(host.code, host.playerId!);
    if (r1_again.success) throw new Error("Security check failed: Role revealed twice!");
    console.log("   Security check passed: Role cannot be revealed twice");

    console.log("✅ VERIFICATION SUCCESSFUL");
}

runVerification().catch(console.error);
