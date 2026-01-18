import { clearApp, prikaziLepConfirmModal } from "../HELPERS/helper.js";

export async function loadCalendar(container, mentorId) {
    clearApp(container);

    const response = await fetch(`http://localhost:5178/api/Sesija/mentor/${mentorId}`);
    const sveSesije = await response.json();

    const topWrapper = document.createElement("div");
    topWrapper.className = "calendar-container";

    const calendarSection = document.createElement("div");
    calendarSection.className = "calendar-section card";

    const headerDiv = document.createElement("div");
    headerDiv.className = "calendar-header";
    
    const title = document.createElement("h2");
    title.textContent = "Januar 2026";

    const addBtn = document.createElement("button");
    addBtn.className = "btn-primary";
    addBtn.textContent = "+ Zakaži sesiju";
    
    addBtn.onclick = () => {
        showAddModal(mentorId, () => loadCalendar(container, mentorId));
    };

    headerDiv.append(title, addBtn);
    calendarSection.appendChild(headerDiv);

    const grid = document.createElement("div");
    grid.className = "calendar-grid";

    const todoSection = document.createElement("div");
    todoSection.className = "todo-section card";
    const todoTitle = document.createElement("h3");
    todoTitle.textContent = "DANAŠNJI PLAN (18.01.)";
    todoSection.appendChild(todoTitle);

    const danasStr = "2026-01-18";
    const danasnjeSesije = sveSesije.filter(s => s.datum.startsWith(danasStr));

    if (danasnjeSesije.length === 0) {
        const p = document.createElement("p");
        p.className = "empty-msg";
        p.textContent = "Nema obaveza za danas.";
        todoSection.appendChild(p);
    } else {
        danasnjeSesije.forEach(s => {
            todoSection.appendChild(kreirajSesijuItem(s, () => loadCalendar(container, mentorId), mentorId));
        });
    }

    const detailsSection = document.createElement("div");
    detailsSection.className = "details-section card";
    
    const detailsTitle = document.createElement("h3");
    detailsTitle.textContent = "Kliknite na datum za detalje";
    
    const detailsContent = document.createElement("div");
    detailsContent.id = "details-content";
    
    detailsSection.append(detailsTitle, detailsContent);

    for (let i = 1; i <= 31; i++) {
        const danMeseca = i.toString().padStart(2, '0');
        const punDatum = `2026-01-${danMeseca}`;
        
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        const dayNum = document.createElement("span");
        dayNum.textContent = i;
        dayDiv.appendChild(dayNum);

        if (sveSesije.some(s => s.datum.startsWith(punDatum))) {
            const dot = document.createElement("div");
            dot.className = "event-dot";
            dayDiv.appendChild(dot);
        }

        dayDiv.onclick = () => {
            document.querySelectorAll(".calendar-day").forEach(d => d.classList.remove("selected-day"));
            dayDiv.classList.add("selected-day");

            while (detailsContent.firstChild) detailsContent.removeChild(detailsContent.firstChild);
            detailsTitle.textContent = `SESIJE ZA DATUM: ${i}. JANUAR 2026`;

            const filtrirane = sveSesije.filter(s => s.datum.startsWith(punDatum));
            if (filtrirane.length === 0) {
                detailsContent.textContent = "Nema zakazanih sesija za ovaj dan.";
            } else {
                filtrirane.forEach(s => {
                    detailsContent.appendChild(kreirajSesijuItem(s, () => loadCalendar(container, mentorId), mentorId));
                });
            }
        };
        grid.appendChild(dayDiv);
    }

    calendarSection.appendChild(grid);
    topWrapper.append(calendarSection, todoSection);
    container.append(topWrapper, detailsSection);
}

function kreirajSesijuItem(s, onRefresh, mentorId) {
    const item = document.createElement("div");
    item.className = "todo-item";
    if (s.status === "Održana") item.style.borderLeftColor = "#2ecc71";

    const info = document.createElement("div");
    info.className = "todo-info";
    
    const sName = document.createElement("strong");
    sName.textContent = s.studentIme;
    
    const pName = document.createElement("span");
    pName.textContent = s.predmetNaziv + (s.status === "Održana" ? " (ODRŽANA)" : "");

    const desc = document.createElement("small");
    const vreme = s.vremeOd.includes('T') ? s.vremeOd.split('T')[1].substring(0, 5) : "---";
    desc.textContent = `${vreme}h - ${s.opis}`;
    
    info.append(sName, pName, desc);

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    if (s.status !== "Održana") {
        const doneBtn = document.createElement("button");
        doneBtn.className = "btn-delete-text";
        doneBtn.textContent = "Završi";
        doneBtn.style.color = "#2ecc71";
        doneBtn.style.borderColor = "#2ecc71";
        doneBtn.onclick = async (e) => {
            e.stopPropagation();
            
            const updateData = {
                mentorId: mentorId.toString(),
                studentId: "nebitno",
                predmetId: "nebitno",
                opis: s.opis || "",
                status: "Održana",
                vremeOd: s.vremeOd,
                vremeDo: s.vremeDo
            };
        
            try {
                const response = await fetch(`http://localhost:5178/api/Sesija/${s.sesijaId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });
        
                if (response.ok) {
                    onRefresh();
                } else {
                    const errorText = await response.text();
                    console.error("Greška pri završavanju:", errorText);
                    alert("Nije uspjelo označavanje kao završeno.");
                }
            } catch (err) {
                console.error("Mrežna greška:", err);
            }
        };
        actions.appendChild(doneBtn);
    }

    const editBtn = document.createElement("button");
    editBtn.className = "btn-delete-text";
    editBtn.textContent = "Izmeni";
    editBtn.onclick = (e) => {
        e.stopPropagation();
        showAddModal(mentorId, onRefresh, s); 
    };

    const delBtn = document.createElement("button");
    delBtn.className = "btn-delete-text";
    delBtn.textContent = "Obriši";
    delBtn.onclick = async (e) => {
        e.stopPropagation();
        prikaziLepConfirmModal("Da li ste sigurni da želite da obrišete ovu sesiju?", async () => {
            await fetch(`http://localhost:5178/api/Sesija/${s.sesijaId}`, { method: 'DELETE' });
            onRefresh();
        });
    };

    actions.append(editBtn, delBtn);
    item.append(info, actions);
    return item;
}

function showAddModal(mentorId, onSaved, postojecaSesija = null) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const content = document.createElement("div");
    content.className = "modal-content";

    const mTitle = document.createElement("h3");
    mTitle.textContent = postojecaSesija ? "Izmeni sesiju" : "Zakaži novu sesiju";

    const inputStud = document.createElement("input");
    inputStud.placeholder = "ID Studenta";
    if(postojecaSesija) { inputStud.value = "Student: " + postojecaSesija.studentIme; inputStud.disabled = true; }

    const inputPred = document.createElement("input");
    inputPred.placeholder = "ID Predmeta";
    if(postojecaSesija) { inputPred.value = "Predmet: " + postojecaSesija.predmetNaziv; inputPred.disabled = true; }

    const inputOpis = document.createElement("textarea");
    inputOpis.placeholder = "Opis...";
    if(postojecaSesija) inputOpis.value = postojecaSesija.opis;

    const inputVreme = document.createElement("input");
    inputVreme.type = "datetime-local";
    if(postojecaSesija) {
        inputVreme.value = postojecaSesija.vremeOd.substring(0, 16);
    }

    const actions = document.createElement("div");
    actions.className = "modal-actions";

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn-primary";
    saveBtn.textContent = postojecaSesija ? "Sačuvaj izmene" : "Zakaži";
    
    saveBtn.onclick = async () => {
        const url = postojecaSesija 
            ? `http://localhost:5178/api/Sesija/${postojecaSesija.sesijaId}`
            : "http://localhost:5178/api/Sesija/zakazi";
        
        const metod = postojecaSesija ? "PUT" : "POST";

        const data = {
            mentorId: mentorId.toString(),
            studentId: postojecaSesija ? "nebitno" : inputStud.value,
            predmetId: postojecaSesija ? "nebitno" : inputPred.value,
            opis: inputOpis.value,
            status: postojecaSesija ? postojecaSesija.status : "Zakazana",
            vremeOd: new Date(inputVreme.value).toISOString(),
            vremeDo: new Date(new Date(inputVreme.value).getTime() + 3600000).toISOString()
        };

        await fetch(url, {
            method: metod,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        overlay.remove();
        onSaved();
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn-secondary";
    cancelBtn.textContent = "Odustani";
    cancelBtn.onclick = () => overlay.remove();

    actions.append(saveBtn, cancelBtn);
    content.append(mTitle, inputStud, inputPred, inputOpis, inputVreme, actions);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}