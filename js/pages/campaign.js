import { CampaignRepository } from "../repositories/campaign-repository.js";

const parametros = new window.URLSearchParams(window.location.search);
const campaign_id = Number(parametros.get('id'));

const campaign_repository = new CampaignRepository();
const campaign = campaign_repository.read(campaign_id);

// WARNING: only a placeholder, should be changed =====================
console.log(campaign_id);


const paragraph = document.createElement('p');

if (campaign) {
    paragraph.textContent = `Campaign ID: ${campaign.id}. Title: ${campaign.title}`;
} else {
    paragraph.textContent = "No campaign found in the URL.";
}

document.body.appendChild(paragraph);
// =============================================
