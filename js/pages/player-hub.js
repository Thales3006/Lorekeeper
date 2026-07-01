import { Player } from "../models/player.js";
import { PlayerRepository } from "../repositories/player-repository.js";
import { CampaignRepository } from "../repositories/campaign-repository.js";

const playerRepository = new PlayerRepository();
const playerForm = document.querySelector("#player-form");
const playerList = document.querySelector("#player-list");
const playerDetail = document.querySelector("#player-detail");
const sidebar = document.querySelector("#player-sidebar");
const backLink = document.querySelector("#back-link");
const nameInput = document.querySelector("#player-name");
const classInput = document.querySelector("#player-class");
const raceInput = document.querySelector("#player-race");
const alignmentSelect = document.querySelector("#player-alignment");
const editButton = document.querySelector("#edit-btn");
const saveButton = document.querySelector("#save-btn");
const discardButton = document.querySelector("#discard-btn");

let selectedPlayer = null;
let isEditing = false;

function setFieldsDisabled(disabled) {
    [nameInput, classInput, raceInput, alignmentSelect].forEach((field) => {
        field.disabled = disabled;
    });
}

function setFormCopy(title, description, eyebrow = "Character sheet") {
    document.querySelector("#player-form-title").textContent = title;
    document.querySelector("#form-description").textContent = description;
    document.querySelector("#form-eyebrow").textContent = eyebrow;
}

function renderForm() {
    if (!selectedPlayer && !isEditing) {
        playerForm.reset();
        alignmentSelect.value = "True Neutral";
        setFieldsDisabled(true);
        setFormCopy("Select a player", "Choose a player from the roster to view their details.");
        editButton.disabled = true;
        editButton.hidden = false;
        saveButton.hidden = true;
        discardButton.hidden = true;
        return;
    }

    if (selectedPlayer && !isEditing) {
        nameInput.value = selectedPlayer.name;
        classInput.value = selectedPlayer.charClass;
        raceInput.value = selectedPlayer.race;
        alignmentSelect.value = selectedPlayer.alignment;
        setFieldsDisabled(true);
        setFormCopy(selectedPlayer.name, `${selectedPlayer.charClass} · ${selectedPlayer.race}`);
        editButton.disabled = false;
        editButton.hidden = false;
        saveButton.hidden = true;
        discardButton.hidden = true;
        return;
    }

    setFieldsDisabled(false);
    setFormCopy(
        selectedPlayer ? `Edit ${selectedPlayer.name}` : "Create a player",
        selectedPlayer ? "Update this character's details below." : "Add a new character to your shared roster.",
        selectedPlayer ? "Editing character" : "New character"
    );
    editButton.hidden = true;
    saveButton.hidden = false;
    discardButton.hidden = false;
}

function showDetail(show) {
    if (window.innerWidth >= 768) return;
    playerDetail.style.display = show ? "block" : "none";
    sidebar.style.display = show ? "none" : "block";
}

function selectPlayer(player) {
    selectedPlayer = player;
    isEditing = false;
    renderForm();
    renderPlayerList();
    showDetail(true);
}

function removePlayer(player) {
    const confirmed = window.confirm(`Delete “${player.name}”? This action cannot be undone.`);
    if (!confirmed) return;

    playerRepository.delete(player.id);
    const campaignRepository = new CampaignRepository();
    campaignRepository.read_all().forEach((campaign) => {
        const currentIds = campaign.players_id ?? [];
        const nextIds = currentIds.filter((id) => Number(id) !== Number(player.id));
        if (nextIds.length !== currentIds.length) {
            campaign.players_id = nextIds;
            campaignRepository.update(campaign);
        }
    });
    if (selectedPlayer?.id === player.id) {
        selectedPlayer = null;
        isEditing = false;
        renderForm();
        showDetail(false);
    }
    renderPlayerList();
}

function createPlayerCard(player) {
    const article = document.createElement("article");
    article.className = "player-card";
    if (selectedPlayer?.id === player.id) article.classList.add("selected");

    const selectButton = document.createElement("button");
    selectButton.className = "player-select";
    selectButton.type = "button";
    selectButton.addEventListener("click", () => selectPlayer(player));

    const avatar = document.createElement("span");
    avatar.className = "player-avatar";
    avatar.textContent = player.name.trim().charAt(0).toUpperCase() || "?";

    const copy = document.createElement("span");
    copy.className = "player-copy";
    const name = document.createElement("strong");
    name.textContent = player.name;
    const details = document.createElement("small");
    details.textContent = `${player.charClass} · ${player.race}`;
    copy.append(name, details);
    selectButton.append(avatar, copy);

    const deleteButton = document.createElement("button");
    deleteButton.className = "player-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${player.name}`);
    deleteButton.addEventListener("click", () => removePlayer(player));

    article.append(selectButton, deleteButton);
    return article;
}

function createEmptyState() {
    const empty = document.createElement("div");
    empty.className = "player-empty";
    const title = document.createElement("strong");
    title.textContent = "No players yet";
    const copy = document.createElement("p");
    copy.textContent = "Create a player to build your roster.";
    empty.append(title, copy);
    return empty;
}

function renderPlayerList() {
    const players = playerRepository.read_all();
    playerList.replaceChildren();
    document.querySelector("#player-total").textContent = players.length;
    if (players.length === 0) {
        playerList.append(createEmptyState());
        return;
    }
    players.forEach((player) => playerList.append(createPlayerCard(player)));
}

function getFormPlayer() {
    return new Player(
        selectedPlayer?.id ?? null,
        nameInput.value.trim(),
        classInput.value.trim(),
        raceInput.value.trim(),
        alignmentSelect.value,
        selectedPlayer?.created_at ?? Date.now()
    );
}

function getNextId() {
    const players = playerRepository.read_all();
    if (players.length === 0) return 0;
    return Math.max(...players.map((player) => Number(player.id) || 0)) + 1;
}

document.querySelector("#new-player-btn").addEventListener("click", () => {
    selectedPlayer = null;
    isEditing = true;
    playerForm.reset();
    alignmentSelect.value = "True Neutral";
    renderForm();
    showDetail(true);
    nameInput.focus();
});

editButton.addEventListener("click", () => {
    isEditing = true;
    renderForm();
    nameInput.focus();
});

playerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!playerForm.reportValidity()) return;

    const textFields = [nameInput, classInput, raceInput];
    const invalidField = textFields.find((field) => !field.value.trim());
    if (invalidField) {
        invalidField.setCustomValidity("This field cannot contain only spaces.");
        invalidField.reportValidity();
        return;
    }

    const player = getFormPlayer();
    if (player.id === null) {
        player.id = getNextId();
        playerRepository.create(player);
    } else {
        playerRepository.update(player);
    }
    selectedPlayer = player;
    isEditing = false;
    renderPlayerList();
    renderForm();
});

[nameInput, classInput, raceInput].forEach((field) => {
    field.addEventListener("input", () => field.setCustomValidity(""));
});

discardButton.addEventListener("click", () => {
    isEditing = false;
    renderForm();
    if (!selectedPlayer) showDetail(false);
});

backLink.addEventListener("click", (event) => {
    event.preventDefault();
    showDetail(false);
});

window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
        playerDetail.style.display = "";
        sidebar.style.display = "";
    }
});

renderPlayerList();
renderForm();
