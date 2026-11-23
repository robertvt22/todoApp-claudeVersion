/*
import "./style.css";

const contPanel = document.querySelector(".panel-container");

function showPanel(namePanel) {
    const panels = document.querySelectorAll(".panel");

    panels.forEach((panel) => {
        panel.classList.remove("is-active");
    });

   const nextPanel = contPanel.querySelector(`.panel-${namePanel}`);

    if (nextPanel) nextPanel.classList.add("is-active");
}

contPanel.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-target]");

    if (!btn) return;

    const target = btn.dataset.target;
    showPanel(target);
});

const todoInput = document.querySelector(".todo-input");
const inputWindow = document.querySelector(".todo-input-window");
const btnClose = document.querySelector(".btn-input-window-close");
const panelInput = document.querySelector(".panel-input");

function openInputWindow() {
    inputWindow.classList.add("is-active");
    panelInput.classList.add("is-imactive");
}

function closeInputWindow() {
    inputWindow.classList.remove("is-active");
    panelInput.classList.remove("is-imactive");
}

todoInput.addEventListener("click", openInputWindow);
btnClose.addEventListener("click", closeInputWindow);

const todoDate = document.querySelector(".curent-date-todo");
const btnPrevDate = document.querySelector(".btn-todo-arrow-left");
const btnNextDate = document.querySelector(".btn-todo-arrow-right");
const btnCalendar = document.querySelector(".btn-todo-calendar");
const datePicker = document.querySelector(".hidden-date");

let currentDate = new Date();

function toInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getDateKey(date = currentDate) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`; // ex: 2026-11-21
}

function updateDate() {
    todoDate.textContent = formatDate(currentDate);
    datePicker.value = toInputValue(currentDate); // ține inputul sincronizat
}

function changeDay(offset) {
    currentDate.setDate(currentDate.getDate() + offset);
    updateDate(); // actualizează textul datei
    renderTasks(); // reafișează taskurile zilei
}

btnPrevDate.addEventListener("click", () => changeDay(-1));
btnNextDate.addEventListener("click", () => changeDay(1));

btnCalendar.addEventListener("click", () => datePicker.showPicker());

const datePicker = document.querySelector(".hidden-date");

datePicker.addEventListener("change", () => {
    if (!datePicker.value) return;

    const [year, month, day] = datePicker.value.split("-").map(Number);
    currentDate = new Date(year, month - 1, day);

    updateDate();
    renderTasks();
});

updateDate(); // afișare inițială

let tasks = []; // toate taskurile aici
const form = document.querySelector(".todo-form");
const taskContainers = document.querySelectorAll(".todo-task-container");




function createTaskElement(task) {
    const el = document.createElement("div");
    el.className = "todo-task-content";
    if (task.completed) el.classList.add("completed");
    el.dataset.id = task.id;

    el.innerHTML = `
    <h2 class="todo-task-title">${task.title}</h2>
    <p class="todo-task-currentDate">${task.dueDate || "-"}</p>
    <p class="todo-task-description">${task.description || ""}</p>
    <div class="todo-task-buttons">
      <button type="button" class="todo-task-check">
        <i class="fa-solid fa-check"></i>
      </button>
      <button type="button" class="todo-task-delete">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;

    return el;
}

const inputContainer = document.querySelector(".panel-input .todo-task-container");
const allContainer = document.querySelector(".panel-task .todo-task-container");

function renderTasks() {
    // Write a task → doar ziua curentă
    const todayTasks = tasks.filter((task) => task.dateKey === getDateKey());

    inputContainer.innerHTML = "";
    todayTasks.forEach((task) => {
        inputContainer.appendChild(createTaskElement(task));
    });

    // See all tasks → toate
    allContainer.innerHTML = "";
    tasks.forEach((task) => {
        allContainer.appendChild(createTaskElement(task));
    });
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const title = data.get("title")?.trim();
    const dueDate = data.get("dueDate") || "";
    const description = data.get("description") || "";

    if (!title) return;

    tasks.push({
        id: crypto.randomUUID(),
        title,
        dueDate,
        description,
        completed: false,
        dateKey: getDateKey(),
    });

    renderTasks();
    form.reset();
    closeInputWindow();
});

taskContainers.forEach((container) => {
    container.addEventListener("click", (e) => {
        const taskEl = e.target.closest(".todo-task-content");
        if (!taskEl) return;

        const id = taskEl.dataset.id;
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        // CHECK
        if (e.target.closest(".todo-task-check")) {
            task.completed = !task.completed;
            renderTasks();
            return;
        }

        // DELETE (ex: doar dacă e completed)
        if (e.target.closest(".todo-task-delete")) {
            if (!task.completed) return;
            tasks = tasks.filter((t) => t.id !== id);
            renderTasks();
        }
    });
});



/* cod vechi
function createTaskElement(title, dueDate, description) {
    const taskItem = document.createElement("div");

    taskItem.classList.add("todo-task-content");

    taskItem.innerHTML = `
      <h2 class="todo-task-title">${title}</h2>
      <p class="todo-task-currentDate">${dueDate}</p>
      <p class="todo-task-description">${description}</p>
      <div class="todo-task-buttons">
        <button class="todo-task-check">
          <i class="fa-solid fa-check"></i>
        </button>
        <button class="todo-task-delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    return taskItem;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);

    const taskTitle = data.get("title")?.trim();
    const taskDueDate = data.get("dueDate");
    const taskDescription = data.get("description");

    if (!taskTitle?.trim()) return;

    taskContainers.forEach((containers) => {
        const taskItem = createTaskElement(taskTitle, taskDueDate, taskDescription);
        containers.appendChild(taskItem);
    });

    form.reset();
    closeInputWindow();
    alert("Task added successfully!");
});

const checkTaskList = document.querySelectorAll(".todo-task-container");

checkTaskList.forEach((taskCheck) => {
    taskCheck.addEventListener("click", (e) => {
        const btnCheck = e.target.closest(".todo-task-check");

        if (btnCheck) {
            const taskItemCheck = btnCheck.closest(".todo-task-content");

            if (!taskItemCheck) return;

            taskItemCheck.classList.toggle("completed");
            return;
        }
    });
});
*/

import "./style.css";

/* =========================
   PANELS (fade)
========================= */
const contPanel = document.querySelector(".panel-container");

function showPanel(namePanel) {
    const panels = document.querySelectorAll(".panel");
    panels.forEach((panel) => panel.classList.remove("is-active"));

    const nextPanel = contPanel.querySelector(`.panel-${namePanel}`);
    if (nextPanel) nextPanel.classList.add("is-active");

    // când deschizi panoul de task-uri → resetează filtrul
    if (namePanel === "task") {
        taskFilter = null;
        renderTasks();
    }
}

contPanel.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-target]");
    if (!btn) return;
    showPanel(btn.dataset.target);
});

/* =========================
   INPUT WINDOW
========================= */
const todoInput = document.querySelector(".todo-input");
const inputWindow = document.querySelector(".todo-input-window");
const btnClose = document.querySelector(".btn-input-window-close");
const panelInput = document.querySelector(".panel-input");

function openInputWindow() {
    inputWindow.classList.add("is-active");
    panelInput.classList.add("is-dimmed");
}

function closeInputWindow() {
    inputWindow.classList.remove("is-active");
    panelInput.classList.remove("is-dimmed");
}

todoInput.addEventListener("click", openInputWindow);
btnClose.addEventListener("click", closeInputWindow);

/* =========================
   CALENDAR
========================= */
const todoDate = document.querySelector(".curent-date-todo");
const btnPrevDate = document.querySelector(".btn-todo-arrow-left");
const btnNextDate = document.querySelector(".btn-todo-arrow-right");
const btnCalendar = document.querySelector(".btn-todo-calendar");
const datePicker = document.querySelector(".hidden-date");

let currentDate = new Date();

function toInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getDateKey(date = currentDate) {
    return toInputValue(date); // 2026-11-20
}

function updateDate() {
    todoDate.textContent = formatDate(currentDate);
    datePicker.value = toInputValue(currentDate);
}

function changeDay(offset) {
    currentDate.setDate(currentDate.getDate() + offset);
    updateDate();
    renderTasks();
    countTaskAll();
    countTaskDone();
}

btnPrevDate.addEventListener("click", () => changeDay(-1));
btnNextDate.addEventListener("click", () => changeDay(1));

btnCalendar.addEventListener("click", () => {
    if (typeof datePicker.showPicker === "function") {
        datePicker.showPicker();
    } else {
        datePicker.click();
    }
});

datePicker.addEventListener("change", () => {
    if (!datePicker.value) return;

    const [year, month, day] = datePicker.value.split("-").map(Number);
    currentDate = new Date(year, month - 1, day);

    updateDate();
    renderTasks();
    countTaskAll();
    countTaskDone();
});

/* =========================
   TASKS (state)
========================= */
let tasks = [];
let taskFilter = "null"; // "all" | "done" | "notDone"

const form = document.querySelector(".todo-form");
const inputContainer = document.querySelector(".panel-input .todo-task-container");
const allContainer = document.querySelector(".panel-task .todo-task-container");

const btnAllTask = document.querySelector(".todo-btn-taskAll");
const btnDoneTask = document.querySelector(".todo-btn-taskDone");
const btnNotDoneTask = document.querySelector(".todo-btn-taskNotDone");

function createTaskElement(task) {
    const el = document.createElement("div");
    el.className = "todo-task-content";
    el.dataset.id = task.id;

    if (task.completed) el.classList.add("completed");

    el.innerHTML = `
    <h2 class="todo-task-title">${task.title}</h2>
    <p class="todo-task-currentDate">${task.dueDate || "-"}</p>
    <p class="todo-task-description">${task.description || ""}</p>
    <div class="todo-task-buttons">
      <button type="button" class="todo-task-check">
        <i class="fa-solid fa-check"></i>
      </button>
      <button type="button" class="todo-task-delete">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;

    return el;
}

function getFilteredTasks() {
    if (taskFilter === "done") {
        return tasks.filter((task) => task.completed);
    }

    if (taskFilter === "notDone") {
        return tasks.filter((task) => !task.completed);
    }

    if (taskFilter === "all") {
        return tasks;
    }

    // când e null → nu afișa nimic
    return [];
}

function renderTasks() {
    const dayKey = getDateKey();

    // Write a task → ziua curentă
    const dayTasks = tasks.filter((task) => task.dateKey === dayKey);
    inputContainer.innerHTML = "";
    dayTasks.forEach((task) => {
        inputContainer.appendChild(createTaskElement(task));
    });

    // See all tasks → după filtru
    const filtered = getFilteredTasks();
    allContainer.innerHTML = "";
    filtered.forEach((task) => {
        allContainer.appendChild(createTaskElement(task));
    });
}

btnAllTask.addEventListener("click", () => {
    taskFilter = "all";
    renderTasks();
});

btnDoneTask.addEventListener("click", () => {
    taskFilter = "done";
    renderTasks();
});

btnNotDoneTask.addEventListener("click", () => {
    taskFilter = "notDone";
    renderTasks();
});

/* =========================
   ADD TASK
========================= */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);

    const title = data.get("title")?.trim();
    const dueDate = data.get("dueDate") || "";
    const description = data.get("description") || "";

    if (!title) return;

    tasks.push({
        id: crypto.randomUUID(),
        title,
        dueDate,
        description,
        completed: false,
        // dacă pui due date, taskul ține de acea zi
        // dacă nu, ține de ziua din calendar
        dateKey: dueDate || getDateKey(),
    });
    saveTasks();
    renderTasks();
    countTaskAll();
    countTaskDone();
    closeInputWindow();
    form.reset();
});

/* =========================
   CHECK + DELETE
========================= */
function handleTaskClick(e) {
    const taskEl = e.target.closest(".todo-task-content");
    if (!taskEl) return;

    const id = taskEl.dataset.id;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // CHECK
    if (e.target.closest(".todo-task-check")) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        countTaskAll();
        countTaskDone();
        return;
    }

    // DELETE doar dacă e completed
    if (e.target.closest(".todo-task-delete")) {
        if (!task.completed) return;
        tasks = tasks.filter((t) => t.id !== id);
        saveTasks();
        renderTasks();
        countTaskAll();
        countTaskDone();
    }
}

inputContainer.addEventListener("click", handleTaskClick);
allContainer.addEventListener("click", handleTaskClick);

/* =========================
   COUNT TASK ALL
========================= */

function countTaskAll() {
    const todoNumberTaskAll = document.querySelector(".todo-allTask");
    if (!todoNumberTaskAll) return;

    const dayKey = getDateKey(); // ziua din calendar
    const dayTasks = tasks.filter((task) => task.dateKey === dayKey);

    todoNumberTaskAll.textContent = dayTasks.length;
}

/* =========================
   COUNT TASK DONE
========================= */

function countTaskDone() {
    const todoNumberTaskDone = document.querySelector(".todo-doneTask");
    if (!todoNumberTaskDone) return;

    const dayKey = getDateKey();

    const doneTasks = tasks.filter((task) => task.dateKey === dayKey && task.completed === true);

    todoNumberTaskDone.textContent = doneTasks.length;
}

const STORAGE_KEY = "todo-app-tasks";

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        tasks = JSON.parse(saved);
    } catch (e) {
        console.error("Eroare la încărcarea task-urilor:", e);
        tasks = [];
    }
}

/* =========================
   INIT
========================= */
updateDate();
loadTasks(); //
renderTasks();
countTaskAll();
countTaskDone();
