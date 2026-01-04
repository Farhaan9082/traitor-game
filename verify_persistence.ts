
import { createGame, joinGame, getGameStatus, startGame, getRole } from "./app/actions";

async function verify() {
    console.log("Starting verification...");

    // 1. Create Game
    const createRes = await createGame("Host");
    if (!createRes.success || !createRes.code) {
        console.error("Failed to create game:", createRes);
        process.exit(1);
    }
    const code = createRes.code;
    console.log(`Game created with code: ${code}`);

    // 2. Join Game (Player 1)
    const join1 = await joinGame(code, "Player1");
    if (!join1.success) {
        console.error("Player1 failed to join:", join1);
        process.exit(1);
    }
    console.log("Player1 joined");

    // 3. Join Game (Player 2)
    const join2 = await joinGame(code, "Player2");
    if (!join2.success) {
        console.error("Player2 failed to join:", join2);
        process.exit(1);
    }
    console.log("Player2 joined");

    // 4. Check Status
    const status = await getGameStatus(code);
    if (!status.success || status.game?.players.length !== 3) {
        console.error("Incorrect player count:", status);
        process.exit(1);
    }
    console.log("Player count verified: 3");

    // 5. Start Game
    const start = await startGame(code);
    if (!start.success) {
        console.error("Failed to start game:", start);
        process.exit(1);
    }
    console.log("Game started");

    // 6. Check Roles
    const hostRole = await getRole(code, createRes.playerId!);
    if (!hostRole.success) {
        console.error("Failed to get host role:", hostRole);
        process.exit(1);
    }
    console.log(`Host role: ${hostRole.role}`);

    console.log("Verification successful!");
}

verify().catch(console.error);
