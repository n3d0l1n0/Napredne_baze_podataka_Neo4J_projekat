import { loadStudents } from "./studentsUI.js";
import { loginMentor } from "../API/mentors.js";
import { setCurrentMentor, getCurrentMentor } from "../HELPERS/helper.js";
import { loadPredmeti } from "../UI/predmetUI.js";
import { loadMentors } from "../UI/mentorsUI.js";
import { clearApp, showMessage } from "../HELPERS/helper.js";

const dashboard = document.getElementById("dashboard");

function showLogin() {
    clearApp(dashboard);

    const loginDiv = document.createElement("div");
    loginDiv.className = "login";

    const emailInput = document.createElement("input");
    emailInput.placeholder = "Email";

    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Login";

    loginBtn.addEventListener("click", async () => {
        try {
            const mentor = await loginMentor(emailInput.value);
            setCurrentMentor(mentor);
            initDashboardUI();
        } catch (err) {
            showMessage(dashboard, err.message, "error");
        }
    });

    loginDiv.append(emailInput, loginBtn);
    dashboard.appendChild(loginDiv);
}

function createSidebar() {
    const sidebar = document.createElement("div");
    sidebar.className = "sidebar";

    const homeBtn = document.createElement("button");
    homeBtn.textContent = "Home";
    homeBtn.addEventListener("click", () => loadSection("home"));

    const studentsBtn = document.createElement("button");
    studentsBtn.textContent = "Studenti";
    studentsBtn.addEventListener("click", () => loadSection("students"));

    const mentorsBtn = document.createElement("button");
    mentorsBtn.textContent = "Mentori";
    mentorsBtn.addEventListener("click", () => loadSection("mentors"));

    const predmetBtn = document.createElement("button");
    predmetBtn.textContent = "Predmeti";
    predmetBtn.addEventListener("click", () => loadSection("predmeti"));

    if (!getCurrentMentor().admin) {
        mentorsBtn.style.display = "none";
    }

    sidebar.append(homeBtn, studentsBtn, mentorsBtn, predmetBtn);

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
    const title = document.createElement("h1");
    title.textContent = `Dobrodošli, ${getCurrentMentor().ime}!`;

    const text = document.createElement("p");
    text.textContent = "Ovo je vaš dashboard gde možete da upravljate studentima i mentorima.";

    mainContainer.append(title, text);
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
