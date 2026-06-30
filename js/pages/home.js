import { CampaignRepository } from "../repositories/campaign-repository.js";
import { PlayerRepository } from "../repositories/player-repository.js";

const campaignRepository = new CampaignRepository();
const playerRepository = new PlayerRepository();

function formatDate(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Date unknown";
    return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function createCampaignPreview(campaign) {
    const link = document.createElement("a");
    link.className = "resume-card";
    link.href = `campaign.html?id=${campaign.id}`;

    const sigil = document.createElement("span");
    sigil.className = "resume-sigil";
    sigil.textContent = campaign.title.trim().charAt(0).toUpperCase() || "?";

    const copy = document.createElement("div");
    copy.className = "resume-copy";
    const label = document.createElement("span");
    label.className = "resume-label";
    label.textContent = "Most recent campaign";
    const title = document.createElement("h3");
    title.textContent = campaign.title;
    const description = document.createElement("p");
    description.textContent = campaign.description;
    const meta = document.createElement("span");
    const playerCount = campaign.players_id?.length ?? 0;
    meta.className = "resume-meta";
    meta.textContent = `${playerCount} ${playerCount === 1 ? "player" : "players"} · Created ${formatDate(campaign.created_at)}`;
    copy.append(label, title, description, meta);

    const action = document.createElement("span");
    action.className = "resume-action";
    action.textContent = "Open dashboard →";
    link.append(sigil, copy, action);
    return link;
}

function renderLastCampaign() {
    const list = document.querySelector("#campaign-preview-list");
    const campaigns = campaignRepository.read_all();
    const lastId = localStorage.getItem("last_campaign_id");
    let campaign = lastId === null ? null : campaignRepository.read(Number(lastId));
    if (!campaign) campaign = campaigns.at(-1) ?? null;

    if (!campaign) {
        const empty = document.createElement("div");
        empty.className = "resume-empty";
        const title = document.createElement("h3");
        title.textContent = "No campaigns yet";
        const copy = document.createElement("p");
        copy.textContent = "Create your first campaign to begin your archive.";
        const link = document.createElement("a");
        link.className = "button button-primary";
        link.href = "campaign-hub.html";
        link.textContent = "Create a campaign";
        empty.append(title, copy, link);
        list.append(empty);
        return;
    }
    list.append(createCampaignPreview(campaign));
}

document.querySelector("#home-campaign-count").textContent = campaignRepository.read_all().length;
document.querySelector("#home-player-count").textContent = playerRepository.read_all().length;
renderLastCampaign();
