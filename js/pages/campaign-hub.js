import { Campaign } from "../models/campaign.js";
import { CampaignRepository } from "../repositories/campaign-repository.js";

const campaign_list = document.querySelector("#campaign-list");

const campaign_repository = new CampaignRepository();
const form = document.querySelector("#add-campaign-form");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);

    const title = data.get("title");
    const description = data.get("description");

    const campaign = new Campaign(null, title, description);
    campaign_repository.create(campaign);
    campaign_list.append(CampaignCardComponent(campaign));

    form.reset();
});

function remove_campaign(id) {
    campaign_repository.delete(id);
    const campaign_card = document.querySelector(`#campaign-${id}`);
    campaign_card.remove();
}

function CampaignCardComponent(campaign) {
    const div = document.createElement('div');
    div.className = 'campaign-card';
    div.id = `campaign-${campaign.id}`;

    div.addEventListener('click', () => {
        window.location.href = `campaign.html?id=${campaign.id}`;
    });

    const btn_delete = document.createElement("button");
    btn_delete.type = "button";
    btn_delete.textContent = "Delete";
    btn_delete.className = "oncorner";

    btn_delete.addEventListener("click", (event) => {
        event.stopPropagation();
        remove_campaign(campaign.id);
    });

    div.innerHTML = `
        <h2>${campaign.title}</h2>
        <p>${campaign.description}</p>
    `;

    div.appendChild(btn_delete);

    return div;
}

function regenerate_view_campaigns() {
    campaign_list.innerHTML = '';
    campaign_repository.read_all().forEach((campaign) => {
        campaign_list.append(CampaignCardComponent(campaign));
    })
}

regenerate_view_campaigns();
