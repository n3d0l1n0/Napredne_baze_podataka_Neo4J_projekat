import { clearApp, showMessage } from "../HELPERS/helper.js";
import {getPredmeti, deletePredmet, updatePredmet,  addPredmet } from "../API/predmet.js";
import { getMyPredmeti } from "../API/mentors.js";
import { addPredmetForMentor } from "../API/predmet.js";
import { prikaziLepConfirmModal } from "../HELPERS/helper.js";

let predmetZaIzmenu = null;

function createTitle() {
    const h1 = document.createElement("h1");
    h1.textContent = "Trenutni predmeti";
    h1.style.color = "#0d47a1";
    h1.style.marginBottom = "1rem";
    return h1;
}

function createForm(container, mentorId) {
    const form = document.createElement("form");
    form.className = "predmet-form";

    const naziv = document.createElement("input");
    naziv.placeholder = "Naziv";
    naziv.required = true;

    const semestar = document.createElement("input");
    semestar.placeholder = "Semestar";
    semestar.required = true;

    const btn = document.createElement("button");
    btn.textContent = "Dodaj Predmet";

    form.append(naziv, semestar, btn);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const predmetData = {
            naziv: naziv.value,
            semestar: parseInt(semestar.value)
        };

        try {
            if (predmetZaIzmenu) {
                await updatePredmet(predmetZaIzmenu.id, predmetData);
                showMessage(container, "Predmet izmenjen", "success");
                predmetZaIzmenu = null;
                btn.textContent = "Dodaj predmet";
            } else {
                await addPredmetForMentor(mentorId, predmetData);
                showMessage(container, "Predmet dodat", "success");
            }

            form.reset();
            loadPredmeti(container, mentorId);

        } catch (err) {
            showMessage(container, err.message, "error");
        }
    });

    form.fillForEdit = (predmet) => {
        naziv.value = predmet.naziv;
        semestar.value=predmet.semestar;

        predmetZaIzmenu = predmet;
        btn.textContent = "Sačuvaj izmene";
    };

    return form;
}

function createList(predmeti, container, mentorId) {
    const wrapper = document.createElement("div");

    const listaTitle = document.createElement("h2");
    listaTitle.textContent = "Lista predmeta";
    listaTitle.style.color = "#0d47a1";
    listaTitle.style.marginBottom = "1.5rem";
    wrapper.appendChild(listaTitle);

    const grid = document.createElement("div");
    grid.className = "cards-grid";

    predmeti.forEach(s => {
        const card = document.createElement("div");
        card.className = "card";

        const title = document.createElement("h4");
        title.textContent = s.naziv;

        const info = document.createElement("p");
        info.textContent = `Semestar: ${s.semestar}`;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const edit = document.createElement("button");
        edit.textContent = "Izmeni";
        edit.className = "btn-icon edit-btn";
        edit.addEventListener("click", () => {
            const form = container.querySelector("form");
            form.fillForEdit(s);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        const del = document.createElement("button");
        del.textContent = "Obriši";
        del.className = "btn-icon delete-btn";
        del.addEventListener("click", () => {
            prikaziLepConfirmModal("Da li ste sigurni da želite da obrišete ovaj predmet?", async () => {
                try {
                    await deletePredmet(s.id);
                    showMessage(container, "Predmet uspešno obrisan", "success");
                    loadPredmeti(container);
                } catch (err) {
                    console.error(err);
                    showMessage(container, "Greška pri brisanju: " + err.message, "error");
                }
            });
        });
        actions.append(edit, del);
        card.append(title, info, actions);
        grid.appendChild(card);
    });

    wrapper.appendChild(grid);
    return wrapper;
}
export async function loadPredmeti(container, mentorId) {
    clearApp(container);

    container.appendChild(createTitle());

    try {
        const predmeti = await getMyPredmeti(mentorId);
        container.appendChild(createForm(container, mentorId));
        container.appendChild(createList(predmeti, container, mentorId));
    } catch (err) {
        showMessage(container, err.message, "error");
    }
}