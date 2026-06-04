import { Campaign } from "../models/campaign.js";

export class CampaignRepository {
    _campaigns = [];

    constructor() { }

    async load_campaigns() {
        // TODO: load real stored campaigns

        // Local Storage sleep mock
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await sleep(1000);

        this._campaigns.push(new Campaign(0, "Dungeons  & Doggos", "A dog adventure RPG"));
        this._campaigns.push(new Campaign(1, "Ordem para normal", "Uma aventura para pessoas normais"));
    }

    get campaigns() {
        return this._campaigns;
    }

    async create_campaign(campaign) {
        this._campaigns.push(campaign);
    }

    async read_campaign(id) {
        return this._campaigns.find((c) => c.id === id);
    }

    async update_campaign(campaign) {
        const index = this._campaigns.findIndex(c => c.id === id);
        if (index !== -1) {
            this._campaigns[index] = campaign;
        }
    }

    async delete_campaign(id) {
        const index = this._campaigns.findIndex(c => c.id === id);
        if (index !== -1) {
                this._campaigns.splice(index, 1);
            }
    }
}
