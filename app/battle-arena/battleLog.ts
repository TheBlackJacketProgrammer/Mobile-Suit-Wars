export type BattleLogPart = { text: string; bold?: boolean };

/** Plain string or a line with optional bold segments (e.g. unit names). */
export type BattleLogEntry = string | BattleLogPart[];
