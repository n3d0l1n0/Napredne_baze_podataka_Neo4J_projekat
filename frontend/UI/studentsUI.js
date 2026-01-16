import { getStudents, addStudent, updateStudent, deleteStudent } from "../API/students.js";
import { clearApp, showMessage } from "../HELPERS/helper.js";

const app = document.getElementById("app");
let studentZaIzmenu = null;

function createTitle() {
    const h1 = document.createElement("h1");
    h1.textContent = "Student Mentor App";
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

    const smer = document.createElement("input");
    smer.placeholder = "Smer";
    smer.required = true;

    const godina = document.createElement("input");
    godina.type = "number";
    godina.placeholder = "Godina studija";
    godina.required = true;

    const btn = document.createElement("button");
    btn.textContent = "Dodaj";

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
                showMessage("Student izmenjen", "success");
                studentZaIzmenu = null;
                btn.textContent = "Dodaj";
            } else {
                await addStudent({ ...student, id: crypto.randomUUID() });
                showMessage("Student dodat", "success");
            }

            form.reset();
            loadStudents();

        } catch (err) {
            showMessage(err.message, "error");
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

function createList(students) {
    const ul = document.createElement("ul");

    students.forEach(s => {
        const li = document.createElement("li");

        const text = document.createElement("span");
        text.textContent = `${s.ime} ${s.prezime} (${s.email})`;

        const edit = document.createElement("button");
        edit.textContent = "✏️";
        edit.addEventListener("click", () => {
            const form = app.querySelector("form");
            form.fillForEdit(s);
        });

        const del = document.createElement("button");
        del.textContent = "❌";
        del.addEventListener("click", async () => {
            try {
                await deleteStudent(s.id);
                showMessage("Student obrisan", "success");
                loadStudents();
            } catch (err) {
                showMessage(err.message, "error");
            }
        });

        li.append(text, edit, del);
        ul.appendChild(li);
    });

    return ul;
}

async function loadStudents() {
    clearApp(app);
    app.appendChild(createTitle());

    try {
        const students = await getStudents();
        app.appendChild(createForm());
        app.appendChild(createList(students));
    } catch (err) {
        showMessage(err.message, "error");
    }
}

loadStudents();
