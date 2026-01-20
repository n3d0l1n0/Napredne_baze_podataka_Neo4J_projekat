import { getAllMentorsAdmin, addMentor, updateMentor, deleteMentor } from "../API/mentors.js";
import { clearApp, showMessage } from "../HELPERS/helper.js";
import { prikaziLepConfirmModal } from "../HELPERS/helper.js";

let mentorZaIzmenu = null;

function createTitle() {
    const h1 = document.createElement("h1");
    h1.textContent = "Upravljanje mentorima";
    h1.style.color = "#0d47a1";
    return h1;
}

function createForm() {
    const form = document.createElement("form");
    form.className = "admin-form card";

    const ime = document.createElement("input");
    ime.placeholder = "Ime"; ime.required = true;

    const prezime = document.createElement("input");
    prezime.placeholder = "Prezime"; prezime.required = true;

    const email = document.createElement("input");
    email.placeholder = "Email"; email.type = "email"; email.required = true;

    const lozinka = document.createElement("input");
    lozinka.placeholder = "Lozinka (za nove mentore)"; lozinka.type = "password";

    const rejting = document.createElement("input");
    rejting.placeholder = "Rejting (1-5)"; rejting.type = "number"; 
    rejting.step = "0.1"; rejting.min = "1"; rejting.max = "5"; rejting.value = "5";

    const tipSelect = document.createElement("select");
    const opcije = ["Student", "Profesor"];
    opcije.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt; o.textContent = opt;
        tipSelect.appendChild(o);
    });

    const adminCheckbox = document.createElement("input");
    adminCheckbox.type = "checkbox";
    const adminLabel = document.createElement("label");
    adminLabel.textContent = " Administrator";
    adminLabel.prepend(adminCheckbox);

    const btn = document.createElement("button");
    btn.className = "btn-primary";
    btn.textContent = "Dodaj mentora";

    form.append(ime, prezime, email, lozinka, rejting, tipSelect, adminLabel, btn);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const mentor = {
            id: mentorZaIzmenu ? mentorZaIzmenu.id : null, 
            ime: ime.value,
            prezime: prezime.value,
            email: email.value,
            lozinka: lozinka.value,
            rejting: parseFloat(rejting.value),
            tip: tipSelect.value,
            admin: adminCheckbox.checked
        };

        try {
            if (mentorZaIzmenu) {
                await updateMentor(mentorZaIzmenu.id, mentor);
                showMessage(form, "Mentor izmenjen", "success");
                mentorZaIzmenu = null;
                btn.textContent = "Dodaj mentora";
            } else {
                const res = await addMentor(mentor); 
                console.log("Backend vratio:", res);
                showMessage(form, "Mentor dodat sa ID-jem", "success");
            }

            form.reset();
            rejting.value = "5";
            loadMentors(form.parentElement);
        } catch (err) {
            showMessage(form, err.message, "error");
        }
    });

    form.fillForEdit = (m) => {
        ime.value = m.ime;
        prezime.value = m.prezime;
        email.value = m.email;
        lozinka.placeholder = "Ostavi prazno ako ne menjaš";
        rejting.value = m.rejting;
        tipSelect.value = m.tip;
        adminCheckbox.checked = m.admin;
        mentorZaIzmenu = m;
        btn.textContent = "Sačuvaj izmene";
    };

    return form;
}

function createList(mentors, container) {
    const wrapper = document.createElement("div");

    const listaTitle = document.createElement("h2");
    listaTitle.textContent = "Lista mentora";
    listaTitle.style.marginBottom = "1.5rem";
    listaTitle.style.color = "#0d47a1";
    wrapper.appendChild(listaTitle);

    const grid = document.createElement("div");
    grid.className = "cards-grid";

    mentors.forEach(m => {
        const card = document.createElement("div");
        card.className = "card";

        const name = document.createElement("h4");
        name.textContent = `${m.ime} ${m.prezime}`;

        const info = document.createElement("p");
        info.textContent = `${m.email} ${m.admin ? "[ADMINISTRATOR]" : "[MENTOR]"}`;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const edit = document.createElement("button");
        edit.textContent = "Izmeni";
        edit.className = "btn-icon edit-btn";
        edit.addEventListener("click", () => {
            const form = container.querySelector("form");
            form.fillForEdit(m);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        const del = document.createElement("button");
        del.textContent = "Obriši";
        del.className = "btn-icon delete-btn";
        del.addEventListener("click", () => {
            prikaziLepConfirmModal("Da li ste sigurni da želite da obrišete ovog mentora?", async () => {
                try {
                    await deleteMentor(m.id);
                    showMessage(container, "Mentor uspešno obrisan", "success");
                    loadMentors(container);
                } catch (err) {
                    console.error(err);
                    showMessage(container, "Greška pri brisanju: " + err.message, "error");
                }
            });
        });

        actions.append(edit, del);
        card.append(name, info, actions);
        grid.appendChild(card);
    });

    wrapper.appendChild(grid);
    return wrapper;
}
export async function loadMentors(container) {
    clearApp(container);

    container.appendChild(createTitle());

    try {
        const mentors = await getAllMentorsAdmin();
        container.appendChild(createForm());
        container.appendChild(createList(mentors, container));
    } catch (err) {
        showMessage(container, err.message, "error");
    }
}