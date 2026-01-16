export let currentMentor = null;

export function setCurrentMentor(mentor) {
    currentMentor = mentor;
}

export function getCurrentMentor() {
    return currentMentor;
}

export function clearApp(app) {
    while (app.firstChild) app.removeChild(app.firstChild);
}

export function showMessage(app, text, type) {
    const msg = document.createElement("div");
    msg.className = type;
    msg.textContent = text;
    app.prepend(msg);
    setTimeout(() => msg.remove(), 3000);
}
