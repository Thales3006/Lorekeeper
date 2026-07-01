import { Campaign } from "../models/campaign.js";
import { CampaignRepository } from "../repositories/campaign-repository.js";

const campaignList = document.querySelector("#campaign-list");
const campaignTotal = document.querySelector("#campaign-total");
const form = document.querySelector("#add-campaign-form");
const formDialog = document.querySelector("#campaign-form-dialog");
const campaignRepository = new CampaignRepository();

function openCampaignForm() {
    formDialog.showModal();
    form.elements.title.focus();
}

function closeCampaignForm() {
    formDialog.close();
}

document.querySelector("#open-campaign-form").addEventListener("click", openCampaignForm);
document.querySelector("#close-campaign-form").addEventListener("click", closeCampaignForm);
document.querySelector("#cancel-campaign-form").addEventListener("click", closeCampaignForm);
formDialog.addEventListener("click", (event) => {
    if (event.target === formDialog) closeCampaignForm();
});

function getNextId() {
    const campaigns = campaignRepository.read_all();
    if (campaigns.length === 0) return 0;
    return Math.max(...campaigns.map((campaign) => Number(campaign.id) || 0)) + 1;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Date unknown";
    return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function removeCampaign(campaign) {
    const confirmed = window.confirm(`Delete “${campaign.title}”? This action cannot be undone.`);
    if (!confirmed) return;
    campaignRepository.delete(campaign.id);
    if (localStorage.getItem("last_campaign_id") === String(campaign.id)) {
        localStorage.removeItem("last_campaign_id");
    }
    renderCampaigns();
}

function createCampaignCard(campaign) {
    const item = document.createElement("li");
    item.className = "campaign-card";

    const body = document.createElement("div");
    body.className = "campaign-card-body";

    const sigil = document.createElement("span");
    sigil.className = "campaign-sigil";
    sigil.textContent = campaign.title.trim().charAt(0).toUpperCase() || "?";

    const copy = document.createElement("div");
    copy.className = "campaign-card-copy";
    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = `campaign.html?id=${campaign.id}`;
    titleLink.textContent = campaign.title;
    title.append(titleLink);
    const description = document.createElement("p");
    description.textContent = campaign.description;

    const meta = document.createElement("div");
    meta.className = "campaign-meta";
    const players = document.createElement("span");
    const playerCount = campaign.players_id?.length ?? 0;
    players.textContent = `${playerCount} ${playerCount === 1 ? "player" : "players"}`;
    const created = document.createElement("span");
    created.textContent = formatDate(campaign.created_at);
    meta.append(players, created);
    copy.append(title, description, meta);
    body.append(sigil, copy);

    const actions = document.createElement("div");
    actions.className = "campaign-card-actions";

    const openLink = document.createElement("a");
    openLink.className = "card-open-link";
    openLink.href = `campaign.html?id=${campaign.id}`;
    openLink.textContent = "Open campaign";
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    openLink.append(arrow);

    const deleteButton = document.createElement("button");
    deleteButton.className = "card-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${campaign.title}`);
    deleteButton.addEventListener("click", () => removeCampaign(campaign));
    actions.append(openLink, deleteButton);

    item.append(body, actions);
    return item;
}

function createEmptyState() {
    const empty = document.createElement("li");
    empty.className = "library-empty";
    const icon = document.createElement("span");
    icon.textContent = "◇";
    icon.setAttribute("aria-hidden", "true");
    const title = document.createElement("h3");
    title.textContent = "Your first story starts here";
    const copy = document.createElement("p");
    copy.textContent = "Use the form to create a campaign and open its dashboard.";
    empty.append(icon, title, copy);
    return empty;
}

function renderCampaigns() {
    const campaigns = campaignRepository.read_all();
    campaignList.replaceChildren();
    campaignTotal.textContent = `${campaigns.length} ${campaigns.length === 1 ? "campaign" : "campaigns"}`;

    if (campaigns.length === 0) {
        campaignList.append(createEmptyState());
        return;
    }

    campaigns.forEach((campaign) => campaignList.append(createCampaignCard(campaign)));
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const titleInput = form.elements.title;
    const descriptionInput = form.elements.description;
    const title = data.get("title").trim();
    const description = data.get("description").trim();
    if (!title || !description) {
        const invalidField = !title ? titleInput : descriptionInput;
        invalidField.setCustomValidity("This field cannot contain only spaces.");
        invalidField.reportValidity();
        return;
    }

    const campaign = new Campaign(
        getNextId(),
        title,
        description
    );
    campaignRepository.create(campaign);
    form.reset();
    renderCampaigns();
    window.location.href = `campaign.html?id=${campaign.id}`;
});

[form.elements.title, form.elements.description].forEach((field) => {
    field.addEventListener("input", () => field.setCustomValidity(""));
});

renderCampaigns();
