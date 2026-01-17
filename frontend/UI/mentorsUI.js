import { getAllMentorsAdmin, addMentor, updateMentor, deleteMentor } from "../API/mentors.js";
import { clearApp, showMessage } from "../HELPERS/helper.js";

let mentorZaIzmenu = null;

function createTitle() {
    const h1 = document.createElement("h1");
    h1.textContent = "Upravljanje mentorima";
    h1.style.color = "#0d47a1";
    return h1;
}

function createForm() {
    const form = document.createElement("form");

    const ime = document.createElement("input");
    ime.placeholder = "Ime";
    ime.required = true;

    const prezime = document.createElement("input");
    prezime.placeholder = "Prezime";
    prezime.required = true;

    const email = document.createElement("input");
    email.placeholder = "Email";
    email.required = true;

    const adminCheckbox = document.createElement("input");
    adminCheckbox.type = "checkbox";
    const adminLabel = document.createElement("label");
    adminLabel.textContent = "Admin";
    adminLabel.appendChild(adminCheckbox);

    const btn = document.createElement("button");
    btn.textContent = "Dodaj mentora";

    form.append(ime, prezime, email, adminLabel, btn);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const mentor = {
            ime: ime.value,
            prezime: prezime.value,
            email: email.value,
            admin: adminCheckbox.checked
        };

        try {
            if (mentorZaIzmenu) {
                await updateMentor(mentorZaIzmenu.id, { ...mentor, id: mentorZaIzmenu.id });
                showMessage(form, "Mentor izmenjen", "success");
                mentorZaIzmenu = null;
                btn.textContent = "Dodaj mentora";
            } else {
                await addMentor({ ...mentor, id: crypto.randomUUID() });
                showMessage(form, "Mentor dodat", "success");
            }

            form.reset();
            loadMentors(form.parentElement);

        } catch (err) {
            showMessage(form, err.message, "error");
        }
    });

    form.fillForEdit = (mentor) => {
        ime.value = mentor.ime;
        prezime.value = mentor.prezime;
        email.value = mentor.email;
        adminCheckbox.checked = mentor.admin;

        mentorZaIzmenu = mentor;
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
        del.addEventListener("click", async () => {
            if(confirm("Obriši mentora?")) {
                try {
                    await deleteMentor(m.id);
                    showMessage(container, "Mentor obrisan", "success");
                    loadMentors(container);
                } catch (err) {
                    showMessage(container, err.message, "error");
                }
            }
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
        container.appendChild(createList(mentors));
    } catch (err) {
        showMessage(container, err.message, "error");
    }
}