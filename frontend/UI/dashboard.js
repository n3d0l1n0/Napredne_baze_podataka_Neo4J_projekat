import { loadStudents } from "./studentsUI.js";
import { loginMentor } from "../API/mentors.js";
import { setCurrentMentor, getCurrentMentor } from "../HELPERS/helper.js";
import { loadPredmeti } from "../UI/predmetUI.js";
import { loadMentors } from "../UI/mentorsUI.js";
import { clearApp, showMessage } from "../HELPERS/helper.js";
import { loadCalendar } from "./calendarUI.js";

const dashboard = document.getElementById("dashboard");

function showLogin() {
    clearApp(dashboard);

    dashboard.className = "login-wrapper";
    const card = document.createElement("div");
    card.className = "login-card";

    const title = document.createElement("h2");
    title.textContent = "Dobrodošli nazad!";

    const subtitle = document.createElement("p");
    subtitle.className = "subtitle";
    subtitle.textContent = "Ulogujte se u Student-Mentor sistem";

    const emailInput = document.createElement("input");
    emailInput.placeholder = "Vaš email";
    emailInput.type = "email";

    const passInput = document.createElement("input");
    passInput.placeholder = "Lozinka";
    passInput.type = "password";

    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Prijavi se";

    const note = document.createElement("p");
    note.className = "admin-note";
    note.innerHTML = "Nemate nalog? <br><strong>Kontaktirajte administratora</strong> za dobijanje kredencijala.";

    loginBtn.addEventListener("click", async () => {
        if (!emailInput.value || !passInput.value) {
            showMessage(dashboard, "Molimo popunite sva polja", "error");
            return;
        }

        try {
            const mentor = await loginMentor(emailInput.value, passInput.value);
            setCurrentMentor(mentor);
            initDashboardUI();
        } catch (err) {
            showMessage(dashboard, "Neispravni podaci", "error");
        }
    });

    card.append(title, subtitle, emailInput, passInput, loginBtn, note);
    dashboard.appendChild(card);
}

function createSidebar() {
    const sidebar = document.createElement("div");
    sidebar.className = "sidebar";

    const logo = document.createElement("h3");
    logo.textContent = "STUDENT MENTOR";
    sidebar.appendChild(logo);

    const menuItems = [
        { name: "Početna", section: "home" },
        { name: "Sesije", section: "calendar" },
        { name: "Studenti", section: "students" },
        { name: "Mentori", section: "mentors", adminOnly: true },
        { name: "Predmeti", section: "predmeti" }
    ];

    menuItems.forEach(item => {
        if (item.adminOnly && !getCurrentMentor().admin) return;

        const btn = document.createElement("button");
        btn.textContent = item.name.toUpperCase();
        btn.className = "sidebar-btn";
        
        btn.addEventListener("click", () => {
            const allBtns = sidebar.querySelectorAll(".sidebar-btn");
            allBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            loadSection(item.section);
        });
        
        sidebar.appendChild(btn);
    });

    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "ODJAVI SE";
    logoutBtn.className = "sidebar-btn logout";
    logoutBtn.style.marginTop = "auto";
    logoutBtn.addEventListener("click", () => {
        setCurrentMentor(null);
        showLogin();
    });
    sidebar.appendChild(logoutBtn);

    return sidebar;
}

function createMain() {
    const main = document.createElement("div");
    main.className = "main";
    return main;
}

let mainContainer;

function loadSection(section) {
    clearApp(mainContainer);

    switch (section) {
        case "home":
            showHome();
            break;
        case "calendar":        
            loadCalendar(mainContainer, getCurrentMentor().id);
            break;
        case "students":
            loadStudents(mainContainer, getCurrentMentor().id);
            break;
        case "mentors":
            if (getCurrentMentor().admin) loadMentors(mainContainer);
            else showMessage(mainContainer, "Nedozvoljeno", "error");
            break;
        case "predmeti":
             loadPredmeti(mainContainer,  getCurrentMentor().id)
            break;
        default:
            showMessage(mainContainer, "Sekcija nije dostupna", "error");
    }
}

function showHome() {
    clearApp(mainContainer);

    const mentor = getCurrentMentor();

    const homeDiv = document.createElement("div");
    homeDiv.className = "home-container";

    const title = document.createElement("h1");
    title.textContent = `Dobrodošli nazad, ${mentor.ime}!`;
    
    const subtitle = document.createElement("p");
    subtitle.style.color = "#666";
    subtitle.innerHTML = `Vaš nivo privilegija: <strong style="color: #0d47a1">${mentor.admin ? "Administrator" : "Mentor"}</strong>`;

    const hr = document.createElement("hr");
    hr.style.margin = "20px 0";
    hr.style.border = "0";
    hr.style.borderTop = "1px solid #eee";

    const infoCard = document.createElement("div");
    infoCard.className = "card";
    infoCard.style.borderLeft = "5px solid #4caf50";

    const infoText = document.createElement("p");
    infoText.textContent = "Sistem je spreman. Koristite meni sa leve strane da upravljate svojim studentima, pregledate predmete ili editujete listu mentora.";
    
    infoCard.appendChild(infoText);
    homeDiv.append(title, subtitle, hr, infoCard);
    mainContainer.appendChild(homeDiv);
}

function initDashboardUI() {
    clearApp(dashboard);

    dashboard.className = "dashboard";

    const sidebar = createSidebar();
    mainContainer = createMain();

    dashboard.append(sidebar, mainContainer);

    loadSection("home");
}

showLogin();
