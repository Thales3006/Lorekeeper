import { CrudRepository } from "./crud-repository.js"
import { Campaign } from "../models/campaign.js";

export class CampaignRepository extends CrudRepository {

    constructor() {
        super();
        this._load();
    }

    _load() {
        let data = localStorage.getItem("campaigns");
        if (data) {
            this._campaigns = JSON.parse(data);
            this._repairIds();
        }
        else {
            this._campaigns = [];
            this._campaigns.push(new Campaign(0, "Dungeons & Doggos", "A dog adventure RPG", []));
            this._campaigns.push(new Campaign(1, "Ordem para normal", "Uma aventura para pessoas normais", []));
            this._save();
        }
    }

    _repairIds() {
        const usedIds = new Set();
        let nextId = this._campaigns.reduce((highest, campaign) => {
            const id = Number(campaign.id);
            return Number.isInteger(id) ? Math.max(highest, id + 1) : highest;
        }, 0);
        let changed = false;

        this._campaigns.forEach((campaign) => {
            const id = Number(campaign.id);
            if (!Number.isInteger(id) || usedIds.has(id)) {
                while (usedIds.has(nextId)) nextId += 1;
                campaign.id = nextId;
                usedIds.add(nextId);
                nextId += 1;
                changed = true;
            } else {
                campaign.id = id;
                usedIds.add(id);
            }
        });

        if (changed) this._save();
    }

    _save() {
        localStorage.setItem("campaigns", JSON.stringify(this._campaigns));
    }

    create(campaign) {
        if (!Number.isInteger(Number(campaign.id))) {
            const ids = this._campaigns.map((item) => Number(item.id)).filter(Number.isInteger);
            campaign.id = ids.length === 0 ? 0 : Math.max(...ids) + 1;
        }
        this._campaigns.push(campaign);
        this._save();
    }

    read(id) {
        return this._campaigns.find((campaign) => Number(campaign.id) === Number(id));
    }

    read_all() {
        return structuredClone(this._campaigns);
    }

    update(campaign) {
        const index = this._campaigns.findIndex(item => Number(item.id) === Number(campaign.id));

        if (index !== -1) {
            this._campaigns[index] = campaign;
            this._save();
        }
    }

    delete(id) {
        const index = this._campaigns.findIndex(campaign => Number(campaign.id) === Number(id));

        if (index !== -1) {
            this._campaigns.splice(index, 1);
            this._save();
        }
    }
}
