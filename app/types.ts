export type Role = "traitor" | "host" | "innocent";

export interface Player {
    id: string;
    name: string;
    role: Role;
    roleSeen: boolean;
}

export interface Game {
    code: string;
    status: "waiting" | "started" | "ended";
    players: Player[];
    createdAt: number;
}
