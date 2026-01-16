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

function createList(mentors) {
    const container = document.createElement("div");

    const listaTitle = document.createElement("h2");
    listaTitle.textContent = "Lista mentora";
    listaTitle.style.marginBottom = "0.8rem";
    listaTitle.style.color = "#0d47a1";
    container.appendChild(listaTitle);

    const ul = document.createElement("ul");

    mentors.forEach(m => {
        const li = document.createElement("li");

        const text = document.createElement("span");
        text.textContent = `${m.ime} ${m.prezime} (${m.email}) ${m.admin ? "[Admin]" : ""}`;

        const edit = document.createElement("button");
        edit.textContent = "Izmeni mentora";
        edit.addEventListener("click", () => {
            const form = container.querySelector("form");
            form.fillForEdit(m);
        });

        const del = document.createElement("button");
        del.textContent = "Obrisi mentora";
        del.addEventListener("click", async () => {
            try {
                await deleteMentor(m.id);
                showMessage(container, "Mentor obrisan", "success");
                loadMentors(container);
            } catch (err) {
                showMessage(container, err.message, "error");
            }
        });

        li.append(text, edit, del);
        ul.appendChild(li);
    });

    container.appendChild(ul);
    return container;
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