import { Campaign } from "../models/campaign.js";
import { CampaignRepository } from "../repositories/campaign-repository.js";
import { PlayerRepository } from "../repositories/player-repository.js";

const params = new URLSearchParams(window.location.search);
const campaignId = params.has("id") ? Number(params.get("id")) : Number.NaN;

const campaignRepository = new CampaignRepository();
const playerRepository = new PlayerRepository();
let campaign = Number.isFinite(campaignId) ? campaignRepository.read(campaignId) : null;

const dashboard = document.querySelector("#campaign-dashboard");
const notFound = document.querySelector("#campaign-not-found");
const editor = document.querySelector("#campaign-editor");
const form = document.querySelector("#campaign-form");
const editButton = document.querySelector("#edit-campaign-btn");
const titleInput = document.querySelector("#campaign-title-input");
const descriptionInput = document.querySelector("#campaign-description-input");
const playerOptions = document.querySelector("#player-options");
const toast = document.querySelector("#save-toast");

function formatDate(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function getCampaignPlayers() {
    const selectedIds = new Set((campaign.players_id ?? []).map(Number));
    return playerRepository.read_all().filter((player) => selectedIds.has(Number(player.id)));
}

function createPlayerCard(player) {
    const item = document.createElement("li");
    item.className = "roster-card";

    const avatar = document.createElement("span");
    avatar.className = "player-avatar";
    avatar.textContent = player.name.trim().charAt(0).toUpperCase() || "?";

    const copy = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = player.name;
    const details = document.createElement("p");
    details.textContent = `${player.charClass} · ${player.race} · ${player.alignment}`;
    copy.append(name, details);
    item.append(avatar, copy);
    return item;
}

function renderRoster(players) {
    const container = document.querySelector("#campaign-player-list");
    container.replaceChildren();

    if (players.length === 0) {
        const empty = document.createElement("li");
        empty.className = "inline-empty";
        const title = document.createElement("strong");
        title.textContent = "No players in this party yet";
        const text = document.createElement("p");
        text.textContent = "Edit the campaign to add players from your roster.";
        empty.append(title, text);
        container.append(empty);
        return;
    }

    players.forEach((player) => container.append(createPlayerCard(player)));
}

function renderCampaign() {
    const players = getCampaignPlayers();
    document.title = `${campaign.title} | LoreKeeper`;
    document.querySelector("#campaign-title").textContent = campaign.title;
    document.querySelector("#campaign-description").textContent = campaign.description;
    document.querySelector("#detail-title").textContent = campaign.title;
    document.querySelector("#detail-description").textContent = campaign.description;
    document.querySelector("#player-count").textContent = players.length;
    document.querySelector("#campaign-created").textContent = formatDate(campaign.created_at);
    document.querySelector("#campaign-id").textContent = campaign.id;
    editButton.disabled = false;
    renderRoster(players);
    localStorage.setItem("last_campaign_id", String(campaign.id));
}

function createPlayerOption(player, selectedIds) {
    const label = document.createElement("label");
    label.className = "player-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "players_id";
    checkbox.value = player.id;
    checkbox.checked = selectedIds.has(Number(player.id));

    const avatar = document.createElement("span");
    avatar.className = "player-avatar player-avatar-small";
    avatar.textContent = player.name.trim().charAt(0).toUpperCase() || "?";

    const copy = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = player.name;
    const detail = document.createElement("small");
    detail.textContent = `${player.charClass} · ${player.race}`;
    copy.append(name, detail);

    label.append(checkbox, avatar, copy);
    return label;
}

function populateEditor() {
    titleInput.value = campaign.title;
    descriptionInput.value = campaign.description;
    playerOptions.replaceChildren();

    const players = playerRepository.read_all();
    if (players.length === 0) {
        const empty = document.createElement("p");
        empty.className = "picker-empty";
        empty.textContent = "No players available. Create players in the Player Hub first.";
        playerOptions.append(empty);
        return;
    }

    const selectedIds = new Set((campaign.players_id ?? []).map(Number));
    players.forEach((player) => playerOptions.append(createPlayerOption(player, selectedIds)));
}

function openEditor() {
    populateEditor();
    editor.showModal();
    titleInput.focus();
}

function closeEditor() {
    editor.close();
}

function showToast() {
    toast.hidden = false;
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
        toast.hidden = true;
    }, 2600);
}

editButton.addEventListener("click", openEditor);
document.querySelector("#close-editor-btn").addEventListener("click", closeEditor);
document.querySelector("#cancel-editor-btn").addEventListener("click", closeEditor);

editor.addEventListener("click", (event) => {
    if (event.target === editor) closeEditor();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const title = data.get("title").trim();
    const description = data.get("description").trim();
    if (!title || !description) {
        const invalidField = !title ? titleInput : descriptionInput;
        invalidField.setCustomValidity("This field cannot contain only spaces.");
        invalidField.reportValidity();
        return;
    }

    const updatedCampaign = new Campaign(
        campaign.id,
        title,
        description,
        data.getAll("players_id").map(Number),
        campaign.created_at
    );

    campaignRepository.update(updatedCampaign);
    campaign = updatedCampaign;
    renderCampaign();
    closeEditor();
    showToast();
});

[titleInput, descriptionInput].forEach((field) => {
    field.addEventListener("input", () => field.setCustomValidity(""));
});

if (!campaign) {
    dashboard.hidden = true;
    notFound.hidden = false;
} else {
    renderCampaign();
}
