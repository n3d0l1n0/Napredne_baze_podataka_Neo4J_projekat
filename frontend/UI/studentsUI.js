import { addStudent, updateStudent, deleteStudent } from "../API/students.js";
import { getMyStudents } from "../API/mentors.js";
import { clearApp, showMessage } from "../HELPERS/helper.js";
import { addStudentForMentor } from "../API/students.js";
import { prikaziLepConfirmModal } from "../HELPERS/helper.js";

let studentZaIzmenu = null;

function createTitle() {
    const h1 = document.createElement("h1");
    h1.textContent = "Trenutni studenti";
    h1.style.color = "#0d47a1";
    h1.style.marginBottom = "1rem";
    return h1;
}

function createForm(container, mentorId) {
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

        const studentData = {
            ime: ime.value,
            prezime: prezime.value,
            email: email.value,
            smer: smer.value,
            godinaStudija: parseInt(godina.value)
        };
    
        try {
            if (studentZaIzmenu) {
                await updateStudent(studentZaIzmenu.id, studentData);
                showMessage(container, "Student izmenjen", "success");
                studentZaIzmenu = null;
                btn.textContent = "Dodaj studenta";
            } else 
            {
                await addStudentForMentor(mentorId, studentData);
                showMessage(container, "Student dodat", "success");
            }
    
            form.reset();
            loadStudents(container, mentorId);
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

function createList(students, container, mentorId) {
    const wrapper = document.createElement("div");

    const listaTitle = document.createElement("h2");
    listaTitle.textContent = "Lista studenata";
    listaTitle.style.color = "#0d47a1";
    listaTitle.style.marginBottom = "1.5rem";
    wrapper.appendChild(listaTitle);

    const grid = document.createElement("div");
    grid.className = "cards-grid";

    students.forEach(s => {
        const card = document.createElement("div");
        card.className = "card";

        const name = document.createElement("h4");
        name.textContent = `${s.ime} ${s.prezime}`;

        const info = document.createElement("p");
        info.textContent = `${s.email} | Smer: ${s.smer} (${s.godinaStudija}. godina)`;

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
            prikaziLepConfirmModal("Da li ste sigurni da želite da obrišete ovog studenta?", async () => {
                try {
                    await deleteStudent(s.id);
                    showMessage(container, "Student uspešno obrisan", "success");
                    loadStudents(container);
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
export async function loadStudents(container, mentorId) {
    clearApp(container);

    container.appendChild(createTitle());

    try {
        const students = await getMyStudents(mentorId);
        container.appendChild(createForm(container, mentorId));
        container.appendChild(createList(students, container, mentorId));
    } catch (err) {
        showMessage(container, err.message, "error");
    }
}