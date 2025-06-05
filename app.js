// Referencias a elementos del DOM
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const tasksList = document.getElementById('tasks-list');
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
    if (tasksList) tasksList.innerHTML = '';
    if (pendingList) pendingList.innerHTML = '';
    if (completedList) completedList.innerHTML = '';

    tasks.forEach((task, index) => {
        const createItem = () => {
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

            // Permitir edición con doble clic en la misma página
            textSpan.addEventListener('dblclick', () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = task.text;
                li.replaceChild(input, textSpan);
                input.focus();

                const save = () => {
                    const newText = input.value.trim();
                    if (newText !== '') {
                        tasks[index].text = newText;
                    }
                    updateStorage();
                    renderTasks();
                };

                input.addEventListener('blur', save);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        save();
                    } else if (e.key === 'Escape') {
                        renderTasks();
                    }
                });
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.addEventListener('click', () => {
                tasks.splice(index, 1);
                updateStorage();
                renderTasks();
            });
            li.appendChild(deleteBtn);

            return li;
        };

        // Elemento para la lista de todas las tareas
        if (tasksList) tasksList.appendChild(createItem());

        // Elemento para listas según estado
        const statusItem = createItem();
        if (task.completed) {
            if (completedList) completedList.appendChild(statusItem);
        } else {
            if (pendingList) pendingList.appendChild(statusItem);
        }
    });

    const completed = tasks.filter(task => task.completed).length;
    progressDisplay.textContent = `Progreso: ${completed} / ${tasks.length}`;
}
