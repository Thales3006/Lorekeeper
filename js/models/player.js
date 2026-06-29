export class Player {
    constructor(id, name, charClass, race, alignment, created_at = Date.now()) {
        this.id = id;
        this.name = name;
        this.charClass = charClass;
        this.race = race;
        this.alignment = alignment;
        this.created_at = created_at;
    }
}
