import { getStudents, addStudent, updateStudent, deleteStudent } from "../API/students.js";
import { getMyStudents } from "../API/mentors.js";
import { clearApp, showMessage } from "../HELPERS/helper.js";

let studentZaIzmenu = null;

function createTitle() {
    const h1 = document.createElement("h1");
    h1.textContent = "Trenutni studenti";
    h1.style.color = "#0d47a1";
    h1.style.marginBottom = "1rem";
    return h1;
}

function createForm(container) {
    const form = document.createElement("form");
    form.className = "student-form";

    const ime = document.createElement("input");
    ime.placeholder = "Ime";
    ime.required = true;

    const prezime = document.createElement("input");
    prezime.placeholder = "Prezime";
    prezime.required = true;

    const email = document.createElement("input");
    email.placeholder = "Email";
    email.required = true;

    const smer = document.createElement("input");
    smer.placeholder = "Smer";
    smer.required = true;

    const godina = document.createElement("input");
    godina.type = "number";
    godina.placeholder = "Godina studija";
    godina.required = true;

    const btn = document.createElement("button");
    btn.textContent = "Dodaj studenta";

    form.append(ime, prezime, email, smer, godina, btn);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const student = {
            ime: ime.value,
            prezime: prezime.value,
            email: email.value,
            smer: smer.value,
            godinaStudija: parseInt(godina.value)
        };

        try {
            if (studentZaIzmenu) {
                await updateStudent(studentZaIzmenu.id, { ...student, id: studentZaIzmenu.id });
                showMessage(container, "Student izmenjen", "success");
                studentZaIzmenu = null;
                btn.textContent = "Dodaj studenta";
            } else {
                await addStudent({ ...student, id: crypto.randomUUID() });
                showMessage(container, "Student dodat", "success");
            }

            form.reset();
            loadStudents(container);

        } catch (err) {
            showMessage(container, err.message, "error");
        }
    });

    form.fillForEdit = (student) => {
        ime.value = student.ime;
        prezime.value = student.prezime;
        email.value = student.email;
        smer.value = student.smer;
        godina.value = student.godinaStudija;

        studentZaIzmenu = student;
        btn.textContent = "Sačuvaj izmene";
    };

    return form;
}

function createList(students, container) {
    const wrapper = document.createElement("div");

    const listaTitle = document.createElement("h2");
    listaTitle.textContent = "Lista studenata";
    listaTitle.style.color = "#0d47a1";
    listaTitle.style.marginBottom = "0.8rem";
    wrapper.appendChild(listaTitle);

    const ul = document.createElement("ul");
    ul.className = "student-list";

    students.forEach(s => {
        const li = document.createElement("li");
        li.className = "student-item";

        const text = document.createElement("span");
        text.textContent = `${s.ime} ${s.prezime} (${s.email})`;
        text.style.marginRight = "1rem";

        const edit = document.createElement("button");
        edit.textContent = "Izmeni studenta";
        edit.className = "btn edit-btn";
        edit.addEventListener("click", () => {
            const form = container.querySelector("form");
            form.fillForEdit(s);
        });

        const del = document.createElement("button");
        del.textContent = "Obrisi studenta";
        del.className = "btn delete-btn";
        del.addEventListener("click", async () => {
            try {
                await deleteStudent(s.id);
                showMessage(container, "Student obrisan", "success");
                loadStudents(container);
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

export async function loadStudents(container, mentorId) {
    clearApp(container);

    container.appendChild(createTitle());

    try {
        const students = await getMyStudents(mentorId);
        container.appendChild(createForm(container));
        container.appendChild(createList(students, container));
    } catch (err) {
        showMessage(container, err.message, "error");
    }
}