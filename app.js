// Referencias a elementos del DOM
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const progressDisplay = document.getElementById('progress');

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
    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            tasks[index].completed = checkbox.checked;
            updateStorage();
            renderTasks();
        });
        li.appendChild(checkbox);

        const textSpan = document.createElement('span');
        textSpan.textContent = task.text;
        li.appendChild(textSpan);

        if (task.completed) {
            li.classList.add('completed');
        }

        // Botón para editar la tarea
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => {
            const newText = prompt('Editar tarea:', task.text);
            if (newText !== null && newText.trim() !== '') {
                tasks[index].text = newText.trim();
                updateStorage();
                renderTasks();
            }
        });

        // Botón para eliminar la tarea
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => {
            tasks.splice(index, 1);
            updateStorage();
            renderTasks();
        });

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        if (task.completed) {
            completedList.appendChild(li);
        } else {
            pendingList.appendChild(li);
        }
    });

    const completed = tasks.filter(task => task.completed).length;
    progressDisplay.textContent = `Progreso: ${completed} / ${tasks.length}`;
}
