import { CrudRepository } from "./crud-repository.js"
import { Player } from "../models/player.js";

export class PlayerRepository extends CrudRepository {

    constructor() {
        super();
        this._load();
    }

    _load() {
        let data = localStorage.getItem("players");
        if (data) {
            this._players = JSON.parse(data);
        }
        else {
            this._players = [];
            this._players.push(new Player(0, "Anton", "Ranger", "Human", "Neutral Good"));
            this._players.push(new Player(1, "Ragnar", "Barbarian", "Orc", "Chaotic Neutral"));
            this._save();
        }
    }

    _save() {
        localStorage.setItem("players", JSON.stringify(this._players));
    }

    create(player) {
        this._players.push(player);
        this._save();
    }

    read(id) {
        return this._players.find((c) => c.id === id);
    }

    read_all() {
        return structuredClone(this._players);
    }

    update(player) {
        const index = this._players.findIndex(c => c.id === player.id);

        if (index !== -1) {
            this._players[index] = player;
            this._save();
        }
    }

    delete(id) {
        const index = this._players.findIndex(c => c.id === id);

        if (index !== -1) {
            this._players.splice(index, 1);
            this._save();
        }
    }
}
