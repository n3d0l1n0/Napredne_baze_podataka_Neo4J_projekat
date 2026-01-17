import { BASE_URL } from "../HELPERS/config.js";

export async function getPredmeti() {
    const res = await fetch(`${BASE_URL}/Predmet`);
    if (!res.ok) throw new Error("Greška pri učitavanju predmeta");
    return await res.json();
}

export async function addPredmet(predmet) {
    const res = await fetch(`${BASE_URL}/Predmet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predmet)
    });
    if (!res.ok) throw new Error("Greška pri dodavanju predmeta");
}

export async function updatePredmet(id, student) {
    const res = await fetch(`${BASE_URL}/Predmet/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student)
    });
    if (!res.ok) throw new Error("Greška pri izmeni predmeta");
}

export async function deletePredmet(id) {
    const res = await fetch(`${BASE_URL}/Predmet/${id}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error("Greška pri brisanju predmeta");
}

export async function addPredmetForMentor(mentorId, predmet) {
    const res = await fetch(`${BASE_URL}/Mentor/add-predmet/${mentorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predmet)
    });
    if (!res.ok) throw new Error("Greška pri dodavanju predmeta za mentora");
}