import "./style.css";

/* =========================
   DATE (funcții ajutătoare)
========================= */

// Returnează "YYYY-MM-DD" în fusul orar LOCAL.
// (toISOString() folosește UTC și poate muta data cu o zi.)
function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Inversul lui toDateKey: "2026-11-22" -> Date (local).
function fromDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
}

// Returnează o dată NOUĂ, mutată cu `offset` zile (originalul nu se modifică).
function addDays(date, offset) {
    const next = new Date(date);
    next.setDate(next.getDate() + offset);
    return next;
}

const longDateFormat = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
});

function formatLongDate(date) {
    return longDateFormat.format(date);
}

/* =========================
   STORAGE (localStorage)
========================= */
const STORAGE_KEY = "todo-app-tasks";
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Verifică și aduce un task salvat la forma curentă. Returnează null dacă datele sunt stricate.
function normalizeTask(raw) {
    if (!raw || typeof raw !== "object") return null;

    // Versiunile vechi salvau ziua în `dateKey`.
    const dueDate = raw.dueDate || raw.dateKey;

    if (typeof raw.id !== "string" || typeof raw.title !== "string") return null;
    if (typeof dueDate !== "string" || !DATE_KEY_PATTERN.test(dueDate)) return null;

    return {
        id: raw.id,
        title: raw.title,
        description: typeof raw.description === "string" ? raw.description : "",
        dueDate,
        completed: raw.completed === true,
    };
}

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return [];

        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];

        return parsed.map(normalizeTask).filter(Boolean);
    } catch (error) {
        console.error("Could not load tasks:", error);
        return [];
    }
}

function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        // De exemplu: spațiu plin sau localStorage blocat de browser.
        console.error("Could not save tasks:", error);
    }
}

/* =========================
   LOGICA TASKURILOR (fără DOM)
   Un task: { id, title, description, dueDate: "YYYY-MM-DD", completed }
========================= */
function createId() {
    // randomUUID există doar în context securizat (https / localhost), de aceea avem fallback.
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createTask({ title, description, dueDate }) {
    return { id: createId(), title, description, dueDate, completed: false };
}

function toggleTask(tasks, id) {
    return tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
}

// Șterge doar taskurile bifate ca "done".
function removeTask(tasks, id) {
    return tasks.filter((task) => !(task.id === id && task.completed));
}

function getTasksForDate(tasks, dateKey) {
    return tasks.filter((task) => task.dueDate === dateKey);
}

// filter: "all" | "done" | "not-done"
function filterTasks(tasks, filter) {
    switch (filter) {
        case "done":
            return tasks.filter((task) => task.completed);
        case "not-done":
            return tasks.filter((task) => !task.completed);
        default:
            return tasks;
    }
}

// sort() e stabil, deci taskurile din aceeași zi rămân în ordinea adăugării.
function sortByDate(tasks) {
    return [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/* =========================
   STATE (singura sursă de adevăr)
========================= */
const state = {
    tasks: loadTasks(),
    currentDate: new Date(),
    filter: "all", // "all" | "done" | "not-done"
};

/* =========================
   ELEMENTE DIN PAGINĂ
========================= */
const $ = (selector) => document.querySelector(selector);

const panelsContainer = $("#panels");
const panels = document.querySelectorAll("[data-panel]");

const dateHeading = $("#planner-title");
const datePicker = $("#date-picker");
const statAll = $("#stat-all");
const statDone = $("#stat-done");

const dayList = $("#day-list");
const allList = $("#all-list");
const filterButtons = document.querySelectorAll("[data-filter]");

const dialog = $("#task-dialog");
const form = $("#task-form");
const titleInput = $("#task-title");
const dueDateInput = $("#task-due-date");
const descriptionInput = $("#task-description");

const taskTemplate = $("#task-template");

/* =========================
   RENDER (desenează pagina pe baza state-ului)
========================= */
function createTaskElement(task) {
    const element = taskTemplate.content.firstElementChild.cloneNode(true);

    element.dataset.id = task.id;
    element.classList.toggle("task--completed", task.completed);

    // textContent (nu innerHTML): textul scris de utilizator nu e interpretat ca HTML.
    element.querySelector(".task__title").textContent = task.title;
    element.querySelector(".task__date").textContent = formatLongDate(fromDateKey(task.dueDate));
    element.querySelector(".task__description").textContent = task.description;

    element.querySelector('[data-action="toggle"]').setAttribute("aria-pressed", String(task.completed));

    const deleteButton = element.querySelector('[data-action="delete"]');
    deleteButton.disabled = !task.completed;
    deleteButton.title = task.completed ? "" : "Complete the task to delete it";

    return element;
}

function renderList(container, tasks, emptyMessage) {
    const scrollTop = container.scrollTop;

    if (tasks.length === 0) {
        const message = document.createElement("p");
        message.className = "task-list__empty";
        message.textContent = emptyMessage;
        container.replaceChildren(message);
    } else {
        container.replaceChildren(...tasks.map(createTaskElement));
    }

    container.scrollTop = scrollTop; // nu sări la început după fiecare bifare
}

function render() {
    const dayKey = toDateKey(state.currentDate);
    const dayTasks = getTasksForDate(state.tasks, dayKey);

    // Planner: ziua curentă
    dateHeading.textContent = formatLongDate(state.currentDate);
    datePicker.value = dayKey;
    statAll.textContent = dayTasks.length;
    statDone.textContent = dayTasks.filter((task) => task.completed).length;
    renderList(dayList, dayTasks, "No tasks for this day.");

    // Toate taskurile, după filtru
    const visibleTasks = sortByDate(filterTasks(state.tasks, state.filter));
    renderList(allList, visibleTasks, "No tasks to show here.");

    filterButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.filter === state.filter));
    });
}

/* =========================
   ACȚIUNI (schimbă state-ul, apoi redesenează)
========================= */
function setDate(date) {
    state.currentDate = date;
    render();
}

function updateTasks(nextTasks) {
    state.tasks = nextTasks;
    saveTasks(state.tasks);
    render();
}

/* =========================
   PANOURI
========================= */
function showPanel(name) {
    panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.panel === name);
    });

    // Mutăm focusul pe titlul noului panou, ca să știe și tastatura / cititorul de ecran unde s-a ajuns.
    document.querySelector(`[data-panel="${name}"] [tabindex="-1"]`)?.focus({ preventScroll: true });
}

panelsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-panel]");
    if (button) showPanel(button.dataset.openPanel);
});

/* =========================
   CALENDAR
========================= */
document.querySelectorAll("[data-day-offset]").forEach((button) => {
    button.addEventListener("click", () => {
        setDate(addDays(state.currentDate, Number(button.dataset.dayOffset)));
    });
});

$("#open-date-picker").addEventListener("click", () => {
    try {
        datePicker.showPicker();
    } catch {
        datePicker.focus(); // browsere fără showPicker()
    }
});

datePicker.addEventListener("change", () => {
    if (datePicker.value) setDate(fromDateKey(datePicker.value));
});

/* =========================
   FEREASTRA "ADD NEW TASK"
========================= */
$("#open-dialog").addEventListener("click", () => {
    dueDateInput.value = toDateKey(state.currentDate); // implicit: ziua pe care o vezi acum
    dialog.showModal();
});

$("[data-close-dialog]").addEventListener("click", () => dialog.close());

// Se declanșează la orice închidere (buton, Escape, după adăugare).
dialog.addEventListener("close", () => form.reset());

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    if (!title) {
        // Doar spații: golim câmpul ca `required` să afișeze mesajul de eroare.
        titleInput.value = "";
        titleInput.reportValidity();
        return;
    }

    const task = createTask({
        title,
        description: descriptionInput.value.trim(),
        dueDate: dueDateInput.value,
    });

    state.currentDate = fromDateKey(task.dueDate); // ne mutăm pe ziua taskului, ca să-l vezi
    updateTasks([...state.tasks, task]);
    dialog.close();
});

/* =========================
   BIFARE + ȘTERGERE
========================= */
function handleTaskClick(event) {
    const button = event.target.closest("[data-action]");
    const card = event.target.closest(".task");
    if (!button || !card) return;

    const list = event.currentTarget;
    const { id } = card.dataset;

    if (button.dataset.action === "toggle") {
        updateTasks(toggleTask(state.tasks, id));
        // Lista a fost redesenată: punem focusul înapoi pe același buton (dacă taskul mai e vizibil).
        const sameCard = [...list.children].find((child) => child.dataset.id === id);
        sameCard?.querySelector('[data-action="toggle"]')?.focus();
    }

    if (button.dataset.action === "delete") {
        updateTasks(removeTask(state.tasks, id));
        list.focus();
    }
}

dayList.addEventListener("click", handleTaskClick);
allList.addEventListener("click", handleTaskClick);

/* =========================
   FILTRE
========================= */
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        state.filter = button.dataset.filter;
        render();
    });
});

/* =========================
   INIT
========================= */
render();
