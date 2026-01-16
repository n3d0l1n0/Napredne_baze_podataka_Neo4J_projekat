import { loadStudents } from "../UI/studentsUI.js";
//import { loadMentors } from "../UI/mentorsUI.js";
import { clearApp, showMessage } from "../HELPERS/helper.js";

const dashboard = document.getElementById("dashboard");

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

    sidebar.append(homeBtn, studentsBtn, mentorsBtn);

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
            loadStudents(mainContainer);
            break;
        case "mentors":
            //loadMentors(mainContainer);
            break;
        default:
            showMessage(mainContainer, "Sekcija nije dostupna", "error");
    }
}

function showHome() {
    const title = document.createElement("h1");
    title.textContent = "Dobrodošli, mentore!";

    const text = document.createElement("p");
    text.textContent = "Ovo je vaš dashboard gde možete da upravljate studentima i mentorima. Kliknite na meni levo da biste pristupili sekcijama.";

    mainContainer.append(title, text);
}

function initDashboard() {
    dashboard.className = "dashboard";

    const sidebar = createSidebar();
    mainContainer = createMain();

    dashboard.append(sidebar, mainContainer);
    loadSection("home");
}

initDashboard();
