import { BASE_URL } from "../HELPERS/config.js";

export async function getStudents() {
    const res = await fetch(`${BASE_URL}/Student`);
    if (!res.ok) throw new Error("Greška pri učitavanju studenata");
    return await res.json();
}

export async function addStudent(student) {
    const res = await fetch(`${BASE_URL}/Student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student)
    });
    if (!res.ok) throw new Error("Greška pri dodavanju studenta");
}

export async function updateStudent(id, student) {
    const res = await fetch(`${BASE_URL}/Student/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student)
    });
    if (!res.ok) throw new Error("Greška pri izmeni studenta");
}

export async function deleteStudent(id) {
    const res = await fetch(`${BASE_URL}/Student/${id}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error("Greška pri brisanju studenta");
}

export async function addStudentForMentor(mentorId, student) {
    const res = await fetch(`${BASE_URL}/Mentor/add-student/${mentorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student)
    });
    if (!res.ok) throw new Error("Greška pri dodavanju studenta za mentora");
}

