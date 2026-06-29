import { Player } from "../models/player.js";
import { PlayerRepository } from "../repositories/player-repository.js";

const player_list = document.querySelector("#player-list");

const player_repository = new PlayerRepository();
const form = document.querySelector("#add-player-form");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);

    const name = data.get("name");
    const charClass = data.get("class");
    const race = data.get("race");
    const alignment = data.get("alignment");

    const player = new Player(null, name, charClass, race, alignment);
    player_repository.create(player);
    player_list.append(PlayerCardComponent(player));

    form.reset();
});

function remove_player(id) {
    player_repository.delete(id);
    const player_card = document.querySelector(`#player-${id}`);
    player_card.remove();
}

function PlayerCardComponent(player) {
    const div = document.createElement('div');
    div.className = 'player-card';
    div.id = `player-${player.id}`;

    div.addEventListener('click', () => {
        window.location.href = `player.html?id=${player.id}`;
    });

    const btn_delete = document.createElement("button");
    btn_delete.type = "button";
    btn_delete.textContent = "Delete";
    btn_delete.className = "oncorner";

    btn_delete.addEventListener("click", (event) => {
        event.stopPropagation();
        remove_player(player.id);
    });

    div.innerHTML = `
        <h2>${player.name}</h2>
        <p>${player.charClass} &bull; ${player.race} &bull; ${player.alignment}</p>
    `;

    div.appendChild(btn_delete);

    return div;
}

function regenerate_view_players() {
    player_list.innerHTML = '';
    player_repository.read_all().forEach((player) => {
        player_list.append(PlayerCardComponent(player));
    })
}

regenerate_view_players();
