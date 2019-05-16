import { IJournal } from "../IJournal";

export class Star {
    constructor(
        public name: string,
        public id: number,
        public location: number[]) { }
}

export class StarRepository {
    private stars: { [id: number]: Star } = {};

    add(journal: IJournal): boolean {
        if (!this.stars[journal.systemAddress]) {
            this.stars[journal.systemAddress] = new Star(journal.starSystem, journal.systemAddress, journal.starPos);
            
            return true;
        }

        return false;
    }

    getAll(): Star[] {
        return Object.values(this.stars);
    }
}