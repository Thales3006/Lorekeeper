import { Campaign } from "../models/campaign.js";

export class CampaignRepository {

    constructor() {
        this._campaigns = [];
        this._load();
    }

    _load() {
        let data = localStorage.getItem("campaigns");
        if (data) {
            this._campaigns = JSON.parse(data);
        }
        else {
            this._campaigns.push(new Campaign(0, "Dungeons  & Doggos", "A dog adventure RPG", []));
            this._campaigns.push(new Campaign(1, "Ordem para normal", "Uma aventura para pessoas normais", []));
            this._save();
        }

        // WARNING: This is only for testing purpouses, should be removed in the full release
        if (this._campaigns.length === 0) {
            this._campaigns.push(new Campaign(0, "Dungeons  & Doggos", "A dog adventure RPG", []));
            this._campaigns.push(new Campaign(1, "Ordem para normal", "Uma aventura para pessoas normais", []));
            this._save();
        }
    }

    _save() {
        localStorage.setItem("campaigns", JSON.stringify(this._campaigns));
    }

    get campaigns() {
        return this._campaigns;
    }

    create_campaign(campaign) {
        this._campaigns.push(campaign);
        this._save();
    }

    read_campaign(id) {
        return this._campaigns.find((c) => c.id === id);
    }

    update_campaign(campaign) {
        const index = this._campaigns.findIndex(c => c.id === campaign.id);

        if (index !== -1) {
            this._campaigns[index] = campaign;
            this._save();
        }
    }

    delete_campaign(id) {
        const index = this._campaigns.findIndex(c => c.id === id);

        if (index !== -1) {
            this._campaigns.splice(index, 1);
            this._save();
        }
    }
}
