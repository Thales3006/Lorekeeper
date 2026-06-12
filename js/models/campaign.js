export class Campaign {
    constructor(id, title, description, players_id = [], created_at = Date.now()) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.players_id = players_id;
        this.created_at = created_at;
    }
}
