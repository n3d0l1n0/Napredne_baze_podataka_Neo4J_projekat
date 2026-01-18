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

export function prikaziLepConfirmModal(poruka, onConfirm) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const content = document.createElement("div");
    content.className = "modal-content";
    content.style.maxWidth = "400px";
    content.style.textAlign = "center";

    const title = document.createElement("h3");
    title.textContent = "Potvrda brisanja";
    title.style.color = "#d32f2f";

    const text = document.createElement("p");
    text.textContent = poruka;
    text.style.margin = "20px 0";

    const actions = document.createElement("div");
    actions.className = "modal-actions";
    actions.style.justifyContent = "center";
    actions.style.gap = "15px";

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn-primary";
    confirmBtn.style.backgroundColor = "#d32f2f";
    confirmBtn.textContent = "Obriši";
    confirmBtn.onclick = async () => {
        await onConfirm();
        overlay.remove();
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn-secondary";
    cancelBtn.textContent = "Odustani";
    cancelBtn.onclick = () => overlay.remove();

    actions.append(confirmBtn, cancelBtn);
    content.append(title, text, actions);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}