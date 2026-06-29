import { Player } from "../models/player.js";
import { PlayerRepository } from "../repositories/player-repository.js";

const playerRepo = new PlayerRepository();

const playerForm = document.querySelector("#player-form");
const playerList = document.querySelector("#player-list");
const playerDetail = document.querySelector("#player-detail");
const sidebar = document.querySelector("#player-sidebar");
const backLink = document.querySelector("#back-link");

const nameInput = document.querySelector("#player-name");
const classInput = document.querySelector("#player-class");
const raceInput = document.querySelector("#player-race");
const alignmentSelect = document.querySelector("#player-alignment");

const editBtn = document.querySelector("#edit-btn");
const saveBtn = document.querySelector("#save-btn");
const discardBtn = document.querySelector("#discard-btn");

let selectedPlayer = null;
let isEditing = false;

function renderForm() {
    if (selectedPlayer === null && !isEditing) {
        nameInput.value = "no player selected";
        classInput.value = "";
        raceInput.value = "";
        alignmentSelect.value = "true-neutral";
        setFieldsDisabled(true);
        editBtn.disabled = true;
        editBtn.hidden = false;
        saveBtn.hidden = true;
        discardBtn.hidden = true;
    } else if (selectedPlayer !== null && !isEditing) {
        nameInput.value = selectedPlayer.name;
        classInput.value = selectedPlayer.charClass;
        raceInput.value = selectedPlayer.race;
        alignmentSelect.value = selectedPlayer.alignment;
        setFieldsDisabled(true);
        editBtn.disabled = false;
        editBtn.hidden = false;
        saveBtn.hidden = true;
        discardBtn.hidden = true;
    } else {
        setFieldsDisabled(false);
        editBtn.disabled = true;
        editBtn.hidden = true;
        saveBtn.hidden = false;
        discardBtn.hidden = false;
    }
}

function setFieldsDisabled(disabled) {
    nameInput.disabled = disabled;
    classInput.disabled = disabled;
    raceInput.disabled = disabled;
    alignmentSelect.disabled = disabled;
}

function showDetail(show) {
    if (window.innerWidth >= 768) return;
    playerDetail.style.display = show ? "block" : "none";
    sidebar.style.display = show ? "none" : "block";
}

function regeneratePlayerList() {
    playerList.innerHTML = "";
    playerRepo.read_all().forEach((player) => {
        playerList.append(PlayerCardComponent(player));
    });
}

function selectPlayer(player) {
    selectedPlayer = player;
    isEditing = false;
    renderForm();
    showDetail(true);
}

function removePlayer(id) {
    playerRepo.delete(id);
    if (selectedPlayer && selectedPlayer.id === id) {
        selectedPlayer = null;
        isEditing = false;
        renderForm();
        showDetail(false);
    }
    regeneratePlayerList();
}

function PlayerCardComponent(player) {
    const div = document.createElement("div");
    div.className = "player-card";
    div.id = `player-${player.id}`;

    div.addEventListener("click", () => {
        selectPlayer(player);
    });

    const btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.textContent = "Delete";
    btnDelete.className = "oncorner";

    btnDelete.addEventListener("click", (event) => {
        event.stopPropagation();
        removePlayer(player.id);
    });

    div.innerHTML = `
        <h2>${player.name}</h2>
        <p>${player.charClass} &bull; ${player.race} &bull; ${player.alignment}</p>
    `;

    div.appendChild(btnDelete);

    return div;
}

function getFormPlayer() {
    return new Player(
        selectedPlayer ? selectedPlayer.id : null,
        nameInput.value,
        classInput.value,
        raceInput.value,
        alignmentSelect.value,
        selectedPlayer ? selectedPlayer.created_at : Date.now()
    );
}

function getNextId() {
    const all = playerRepo.read_all();
    if (all.length === 0) return 0;
    return Math.max(...all.map(p => p.id)) + 1;
}

document.querySelector("#new-player-btn").addEventListener("click", () => {
    selectedPlayer = null;
    isEditing = true;
    nameInput.value = "";
    classInput.value = "";
    raceInput.value = "";
    alignmentSelect.value = "true-neutral";
    renderForm();
    showDetail(true);
});

editBtn.addEventListener("click", () => {
    isEditing = true;
    renderForm();
});

saveBtn.addEventListener("click", () => {
    if (!playerForm.checkValidity()) {
        playerForm.reportValidity();
        return;
    }
    const player = getFormPlayer();
    if (player.id === null) {
        player.id = getNextId();
        playerRepo.create(player);
    } else {
        playerRepo.update(player);
    }
    selectedPlayer = player;
    isEditing = false;
    regeneratePlayerList();
    renderForm();
});

discardBtn.addEventListener("click", () => {
    isEditing = false;
    if (selectedPlayer === null) {
        renderForm();
        showDetail(false);
    } else {
        renderForm();
    }
});

backLink.addEventListener("click", (e) => {
    e.preventDefault();
    showDetail(false);
});

window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
        playerDetail.style.display = "";
        sidebar.style.display = "";
    }
});

regeneratePlayerList();
renderForm();
