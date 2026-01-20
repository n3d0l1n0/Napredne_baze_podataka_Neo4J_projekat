const BASE_URL = "http://localhost:5178/api/Sesija";

export const sesijaService = {
    async getSesijeZaMentora(mentorId) {
        const res = await fetch(`${BASE_URL}/mentor/${mentorId}`);
        return await res.json();
    },

    async zakaziSesiju(data) {
        return await fetch(`${BASE_URL}/zakazi`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    },

    async azurirajSesiju(sesijaId, data) {
        return await fetch(`${BASE_URL}/${sesijaId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    },

    async obrisiSesiju(sesijaId) {
        return await fetch(`${BASE_URL}/${sesijaId}`, {
            method: "DELETE"
        });
    }
};