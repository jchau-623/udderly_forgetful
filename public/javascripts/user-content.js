// import { name } from "./index.js";
document.addEventListener("DOMContentLoaded", (e) => {
  // name();
  /*--------------------------------------------------------------------*/
  // INITIALIZING PAGE
  const emptyTaskInit = document.querySelector(".empty-task-template");
  /*--------------------------------------------------------------------*/
  // INIT FUNC
  const initialize = () => {
    for (let i = 0; i < 70; i++) {
      const div = document.createElement("div");
      emptyTaskInit.appendChild(div);
    }
  };
  initialize();
  /*--------------------------------------------------------------------*/
  // ELEMENTS
  const addTaskInput = document.getElementById("add-task-input");
  const addTaskForm = document.querySelector(".add-task-form2");
  const addTaskButton = document.getElementById("add-task-button");
  const addedTasks = document.querySelector(".added-tasks");
  const lists = document.querySelector(".added-list-child-container");
  const trashIcon = document.getElementById("trash-icon");
  const allTasks = document.querySelector("#all-tasks");
  const currentList = document.querySelector(".current-list");
  /*--------------------------------------------------------------------*/
  // GLOBAL VARIABLES
  let listId;
  let taskId;
  /*--------------------------------------------------------------------*/
  // FUNCTIONS
  const fetchAllTasks = (data) => {
    data.forEach((task) => {
      const div = document.createElement("div");
      div.id = task.id;
      div.classList.add("pre-filled");
      const boiler = `<div class="filled" data-id=${task.id}><input type="checkbox" data-id=${task.id}><p data-id=${task.id}>${task.description}</p></div>`;
      div.innerHTML = boiler;
      addedTasks.appendChild(div);
    });
  };
  /*--------------------------------------------------------------------*/
  // SHOW ADD TASK BUTTON LISTENER
  addTaskInput.addEventListener("focus", (e) => {
    addTaskButton.classList.remove("hide-button");
  });
  /*--------------------------------------------------------------------*/
  // HIDE ADD TASK BUTTON
  document.addEventListener("click", (e) => {
    if (e.target !== addTaskInput) {
      addTaskButton.classList.add("hide-button");
    }
  });
  /*--------------------------------------------------------------------*/
  // RENDER TASKS FROM SELECTED LIST
  lists.addEventListener("click", async (e) => {
    listId = e.target.id;
    currentList.innerHTML = e.target.innerHTML;
    if (
      listId !== "all-tasks" ||
      listId !== "today" ||
      listId !== "tomorrow" ||
      listId !== "this-week"
    ) {
      const res = await fetch(`/api/lists/${listId}`);

      const data = await res.json();
      if (data.message !== "Failed") {
        addedTasks.innerHTML = "";
        fetchAllTasks(data);
      }
    } else {
      currentList.innerHTML = e.target.innerHTML;
    }
  });
  /*--------------------------------------------------------------------*/
  /*--------------------------------------------------------------------*/
  // ADDING TASK TO PAGE AND DATABASE
  addTaskButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const formData = new FormData(addTaskForm);

    const description = formData.get("description");

    try {
      let body = { description };
      if (listId) {
        body = { description, listId };
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw res;
      }

      const data = await res.json();

      if (data.message === "Success") {
        const val = addTaskInput.value;
        const div = document.createElement("div");
        div.id = data.task.id;
        div.classList.add("pre-filled");
        const boiler = `<div class="filled" data-id=${data.task.id}><input type="checkbox" data-id=${data.task.id}><p data-id=${data.task.id}>${val}</p></div>`;
        div.innerHTML = boiler;
        addedTasks.appendChild(div);
        addTaskInput.value = "";
      }
    } catch (e) {
      console.error(e);
    }
  });
  /*--------------------------------------------------------------------*/
  // SELECTING TASKS
  addedTasks.addEventListener("click", async (e) => {
    taskId = !e.target.id ? e.target.dataset.id : e.target.id;
    const taskDiv = document.getElementById(taskId);
    taskDiv.classList.toggle("selected");
    /*--------------------------------------------------------------------*/
    // FETCHING TASK DETAILS
    try {
      const res = await fetch(`/api/tasks/${taskId}`);

      const data = await res.json();
      console.log(data);
      if (!data.message) {
        const taskName = document.querySelector(".task-name");
        const listName = document.querySelector(".list-name");
        const dueDate = document.querySelector(".due-date");
        const selected = document.querySelectorAll(".selected");
        console.log(selected);
        if (selected.length > 1) {
          taskName.innerHTML = `${selected.length} tasks selected`;
          listName.innerHTML = "";
          dueDate.innerHTML = "";
        } else if (selected.length === 1) {
          if (taskDiv.classList.contains("selected")) {
            taskName.innerHTML = data.description;
            listName.innerHTML = data.List.name;
            dueDate.innerHTML = !data.dueAt ? "never" : data.dueAt;
          } else {
            try {
              const res = await fetch(`/api/tasks/${selected[0].id}`);
              const data = await res.json();
              taskName.innerHTML = data.description;
              listName.innerHTML = data.List.name;
              dueDate.innerHTML = !data.dueAt ? "never" : data.dueAt;
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          taskName.innerHTML = "";
          listName.innerHTML = "";
          dueDate.innerHTML = "";
        }
      }
    } catch (e) {
      console.error(e);
    }
  });
  /*--------------------------------------------------------------------*/
  // DELETING TASKS FROM DATABASE AND PAGE
  trashIcon.addEventListener("click", async (e) => {
    const tasks = document.querySelectorAll(".selected");
    console.log(tasks);
    tasks.forEach(async (task) => {
      taskId = !task.id ? task.dataset.id : task.id;
      try {
        const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });

        // if (!res.ok) throw res;
        const data = await res.json();
        console.log(data);
        if (data.message === "Destroyed") {
          addedTasks.removeChild(task);
        } else {
          console.log("failed");
        }
      } catch (e) {
        console.error(e);
      }
    });
  });
  /*--------------------------------------------------------------------*/
  // FETCHING ALL TASKS
  allTasks.addEventListener("click", async (e) => {
    listId = undefined;
    currentList.innerHTML = "All Tasks";
    try {
      const res = await fetch("/api/tasks");

      const data = await res.json();
      console.log(data);
      if (data.message !== "Failed") {
        addedTasks.innerHTML = "";
        fetchAllTasks(data);
      }
    } catch (e) {
      console.error(e);
    }
  });
});
