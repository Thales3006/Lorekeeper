import { CampaignRepository } from "../repositories/campaign-repository.js";

const campaign_repository = new CampaignRepository();

function CampaignResumeCard(campaign) {
    const li = document.createElement("li");

    const a = document.createElement("a");
    a.className = "resume-card";
    a.href = `campaign.html?id=${campaign.id}`;

    const title = document.createElement("p");
    title.className = "resume-card-title";
    title.textContent = campaign.title;

    const desc = document.createElement("p");
    desc.className = "resume-card-desc";
    desc.textContent = campaign.description;

    a.appendChild(title);
    a.appendChild(desc);
    li.appendChild(a);

    return li;
}

function render_last_campaign() {
    const list = document.querySelector("#campaign-preview-list");

    const last_id_raw = localStorage.getItem("last_campaign_id");
    let campaign = null;

    if (last_id_raw !== null) {
        campaign = campaign_repository.read(Number(last_id_raw));
    }

    if (!campaign) {
        const all = campaign_repository.read_all();
        campaign = all.length > 0 ? all[all.length - 1] : null;
    }

    if (!campaign) {
        const p = document.createElement("p");
        p.className = "resume-empty";
        p.textContent = "No campaigns yet. Create one in the Campaign Hub!";
        list.appendChild(p);
        return;
    }

    list.appendChild(CampaignResumeCard(campaign));
}

function render_next_session(session) {
    const container = document.querySelector("#next-session-content");
    container.innerHTML = "";

    const article = document.createElement("article");
    article.className = "session-card";

    const campaign_name = document.createElement("p");
    campaign_name.className = "session-card-campaign";
    campaign_name.textContent = session.campaign_title;

    const date_el = document.createElement("time");
    date_el.className = "session-card-date";
    date_el.dateTime = session.date.toISOString();
    date_el.textContent = session.date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    article.appendChild(campaign_name);
    article.appendChild(date_el);

    if (session.notes) {
        const notes = document.createElement("p");
        notes.className = "session-card-notes";
        notes.textContent = session.notes;
        article.appendChild(notes);
    }

    container.appendChild(article);
}

render_last_campaign();
