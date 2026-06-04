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

    add_campaign(campaign) {
        this._campaigns.push(campaign);
    }
}
