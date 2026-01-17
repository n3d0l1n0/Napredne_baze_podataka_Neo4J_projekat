import { clearApp, showMessage } from "../HELPERS/helper.js";
import {getPredmeti, deletePredmet, updatePredmet,  addPredmet } from "../API/predmet.js";
import { getMyPredmeti } from "../API/mentors.js";
import { addPredmetForMentor } from "../API/predmet.js";

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
    listaTitle.style.marginBottom = "0.8rem";
    wrapper.appendChild(listaTitle);

    const ul = document.createElement("ul");
    ul.className = "predmet-list";

    predmeti.forEach(s => {
        const li = document.createElement("li");
        li.className = "predmet-item";

        const text = document.createElement("span");
        text.textContent = `${s.naziv}, Semestar: ${s.semestar}`;
        text.style.marginRight = "1rem";

        const edit = document.createElement("button");
        edit.textContent = "Izmeni predmet";
        edit.className = "btn edit-btn";
        edit.addEventListener("click", () => {
            const form = container.querySelector("form");
            form.fillForEdit(s);
        });

        const del = document.createElement("button");
        del.textContent = "Obrisi predmet";
        del.className = "btn delete-btn";
        del.addEventListener("click", async () => {
            try {
                await deletePredmet(s.id);
                showMessage(container, "Predmet obrisan", "success");
                loadPredmeti(container, mentorId);
            } catch (err) {
                showMessage(container, err.message, "error");
            }
        });

        li.append(text, edit, del);
        ul.appendChild(li);
    });

    wrapper.appendChild(ul);
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