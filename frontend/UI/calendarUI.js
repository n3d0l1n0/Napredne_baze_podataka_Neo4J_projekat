import { clearApp } from "../HELPERS/helper.js";

export async function loadCalendar(container, mentorId) {
    clearApp(container);
    
    const response = await fetch(`http://localhost:5178/api/Sesija/mentor/${mentorId}`);
    const sesije = await response.json();

    const today = new Date().toISOString().split('T')[0];

    const calendarWrapper = document.createElement("div");
    calendarWrapper.className = "calendar-layout"; // Dodaj u CSS

    const calendarGrid = document.createElement("div");
    calendarGrid.className = "calendar-grid card";
    
    for (let i = 1; i <= 31; i++) {
        const dayBox = document.createElement("div");
        dayBox.className = "day-box";
        dayBox.innerHTML = `<span>${i}</span>`;
        
        const hasSession = sesije.some(s => new Date(s.datum).getDate() === i);
        if (hasSession) dayBox.classList.add("has-event");

        calendarGrid.appendChild(dayBox);
    }

    const todoList = document.createElement("div");
    todoList.className = "todo-sidebar card";
    
    const todoTitle = document.createElement("h3");
    todoTitle.textContent = "DANAS - OBAVEZE";
    todoList.appendChild(todoTitle);

    const danasnjeSesije = sesije.filter(s => s.datum.split('T')[0] === today);

    if (danasnjeSesije.length === 0) {
        const p = document.createElement("p");
        p.textContent = "Nema zakazanih sesija za danas.";
        todoList.appendChild(p);
    } else {
        danasnjeSesije.forEach(s => {
            const item = document.createElement("div");
            item.className = "todo-item";
            item.innerHTML = `
                <strong>${s.vremeOd.split('T')[1].substring(0,5)}</strong> - ${s.studentIme}<br>
                <small>${s.predmetNaziv}: ${s.opis}</small>
            `;
            todoList.appendChild(item);
        });
    }

    calendarWrapper.append(calendarGrid, todoList);
    container.appendChild(calendarWrapper);
}