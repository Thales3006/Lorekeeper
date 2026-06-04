import { Campaign } from "../models/campaign.js";
import { CampaignRepository } from "../repositories/campaign-repository.js";

const btn_add_campaign = document.querySelector("#btn-add-campaign");
const campaign_list = document.querySelector("#campaign-list");

const campaign_repository = new CampaignRepository();

function CampaignCardComponent(campaign) {
  const div = document.createElement('div');
  div.className = 'campaign-card';
  
  div.innerHTML = `
    <h2>${campaign.title}</h2>
    <p>${campaign.description}</p>
  `;
  
  return div;
}

function regenerate_view_campaigns() {
    campaign_list.innerHTML = '';
    campaign_repository.campaigns.forEach((campaign) => {
        campaign_list.append(CampaignCardComponent(campaign));
    })
}

async function load_campaigns() {
    await campaign_repository.load_campaigns();
    regenerate_view_campaigns();
}

btn_add_campaign.addEventListener("click", () => {
    const campaign = new Campaign(null, "title", "description");

    campaign_repository.add_campaign(campaign);
    campaign_list.append(CampaignCardComponent(campaign));

    console.log(campaign_repository.campaigns);
});

load_campaigns();
