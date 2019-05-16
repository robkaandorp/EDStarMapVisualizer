export enum EventEnum {
    Docked = "Docked",
    FSDJump = "FSDJump",
    Scan = "Scan",
    Location = "Location"
}

export interface IJournal {
    timestamp: Date,
    event: EventEnum,
    starSystem: string,
    starPos: number[],
    systemAddress: number,
    uploaderId: string
}