const API_URL = "http://localhost:3000/api/tasks";

const taskInput = document.querySelector(".task-input input");
const filters = document.querySelectorAll(".filters span");
const clearAll = document.querySelector(".clear-btn");
const taskBox = document.querySelector(".task-box");

let editId,
    isEditTask = false,
    todos = JSON.parse(localStorage.getItem("todo-list"));

filters.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector("span.active").classList.remove("active");
        btn.classList.add("active");
        loadTasks(btn.id);
    });
});

const loadTasks = (filter) => {
    fetch(API_URL)
        .then(res => res.json())
        .then(json => {
            const totalTasks = json?.data?.length;
            if (totalTasks > 0) {
                const todos = json.data;
                let liTag = "";
                if (todos) {
                    todos.forEach((todo) => {
                        let completed = todo.status == "completed" ? "checked" : "";
                        if (filter == todo.status || filter == "all") {
                            liTag += `<li class="task">
                            <label for="${todo._id}">
                                <input onclick="updateStatus(this)" type="checkbox" id="${todo._id}" ${completed}>
                                <p class="${completed}">${todo.content}</p>
                            </label>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="task-menu">
                                    <li onclick='deleteTask(${todo._id}, "${filter}")'><i class="uil uil-trash"></i>Delete</li>
                                </ul>
                            </div>
                        </li>`;
                        }
                    });
                }
                taskBox.innerHTML = liTag || `<span>You don't have any task here</span>`;
                let checkTask = taskBox.querySelectorAll(".task");
                !checkTask.length ? clearAll.classList.remove("active") : clearAll.classList.add("active");
                taskBox.offsetHeight >= 300 ? taskBox.classList.add("overflow") : taskBox.classList.remove("overflow");
            }
        })
        .catch(error => {
            console.log("error", error);
        });
}

loadTasks("all");

const showMenu = (selectedTask) => {
    let menuDiv = selectedTask.parentElement.lastElementChild;
    menuDiv.classList.add("show");
    document.addEventListener("click", e => {
        if (e.target.tagName != "I" || e.target != selectedTask) {
            menuDiv.classList.remove("show");
        }
    });
}

taskInput.addEventListener("keyup", e => {
    let userTask = taskInput.value.trim();
    if (e.key == "Enter" && userTask) {
        console.log("Create Task");
        todos = !todos ? [] : todos;
        let data = { content: userTask, status: "pending" };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

        fetch(API_URL, options)
            .then(res => res.json())
            .then((json) => {
                taskInput.value = "";
                loadTasks(document.querySelector("span.active").id);
            })
            .catch(error => {
                console.log("error", error);
            });
    }
});

const updateStatus = (selectedTask) => {
    console.log("Update Task");
    const { id, checked, parentElement } = selectedTask;
    const status = checked ? "completed" : "pending";

    const data = {
        status
    };
    const options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };

    fetch(`${API_URL}/${id}`, options)
        .then(res => res.json())
        .then((json) => {
            let taskName = parentElement.lastElementChild;
            if (checked) {
                taskName.classList.add("checked");
            } else {
                taskName.classList.remove("checked");
            }
        })
        .catch(error => {
            console.log("error", error);
        });
}

const deleteTask = (id, filter) => {
    console.log("Delete Task", id, filter);
    const options = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    }
    fetch(`${API_URL}/${id}`, options)
        .then(res => res.json())
        .then((json) => {
            loadTasks(filter);
        })
        .catch(error => {
            console.log("error", error);
        });
}

clearAll.addEventListener("click", () => {
    console.log("Clear All");
    const options = {
        method: "DELETE"
    }
    fetch(API_URL, options)
        .then(res => res.json())
        .then((json) => {
            clearAll.classList.remove("active")
            taskBox.innerHTML = "";
        })
        .catch(error => {
            console.log("error", error);
        });
});