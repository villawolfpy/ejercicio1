// Referencias a elementos del DOM
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

// Cargar tareas guardadas al iniciar la página
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
renderTasks();

// Evento para agregar nueva tarea
addTaskButton.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text !== '') {
        const newTask = { text, completed: false };
        tasks.push(newTask);
        updateStorage();
        renderTasks();
        taskInput.value = '';
    }
});

// Funciones auxiliares
function updateStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task.text;
        if (task.completed) {
            li.classList.add('completed');
        }

        // Botón para marcar como completada
        const completeBtn = document.createElement('button');
        completeBtn.textContent = 'Completar';
        completeBtn.addEventListener('click', () => {
            tasks[index].completed = !tasks[index].completed;
            updateStorage();
            renderTasks();
        });

        // Botón para eliminar la tarea
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.addEventListener('click', () => {
            tasks.splice(index, 1);
            updateStorage();
            renderTasks();
        });

        li.appendChild(completeBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}
