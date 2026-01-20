import { BASE_URL } from "../HELPERS/config.js";

export async function loginMentor(email, lozinka) {
    const response = await fetch(`${BASE_URL}/Mentor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lozinka })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Greška pri logovanju");
    }

    return await response.json();
}

export async function getMyStudents(mentorId) {
    const res = await fetch(`${BASE_URL}/Mentor/my-students/${mentorId}`);
    if (!res.ok) throw new Error("Greška pri učitavanju studenata");
    return await res.json();
}

export async function getMyPredmeti(mentorId) {
    const res = await fetch(`${BASE_URL}/Mentor/my-predmeti/${mentorId}`);
    if (!res.ok) throw new Error("Greška pri učitavanju predmeta");
    return await res.json();
}

export async function getAllMentorsAdmin() {
    const res = await fetch(`${BASE_URL}/Mentor/all`);
    if (!res.ok) throw new Error("Greška pri učitavanju mentora");
    return await res.json();
}

export async function addMentor(mentor) {
    const res = await fetch(`${BASE_URL}/Mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mentor)
    });
    
    if (!res.ok) throw new Error("Greška pri dodavanju");
    
    return await res.json();
}

export async function updateMentor(id, mentorData) {
    const res = await fetch(`${BASE_URL}/Mentor/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mentorData)
    });
    if (!res.ok) throw new Error("Greška pri izmeni mentora na serveru");
}

export async function deleteMentor(id) {
    const res = await fetch(`${BASE_URL}/Mentor/${id}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error("Greška pri brisanju mentora");
}