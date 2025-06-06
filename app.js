// Referencias a elementos del DOM
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const tasksList = document.getElementById('tasks-list');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const progressDisplay = document.getElementById('progress');
const searchInput = document.getElementById('search');
const exportBtn = document.getElementById('export-tasks');
const importInput = document.getElementById('import-tasks');
const importBtn = document.getElementById('import-button');
const navAll = document.getElementById('nav-all');
const navPending = document.getElementById('nav-pending');
const navCompleted = document.getElementById('nav-completed');
let searchQuery = '';
let draggedIndex = null;

// Detectar si estamos en la página de tareas completadas
const isCompletedPage = !!completedList && !tasksList && !pendingList;

// Cargar tareas guardadas al iniciar la página
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
renderTasks();

if (searchInput) {
    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.toLowerCase();
        renderTasks();
    });
}

if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(tasks)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.json';
        a.click();
        URL.revokeObjectURL(url);
    });
}

if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', async () => {
        const file = importInput.files[0];
        if (file) {
            const text = await file.text();
            tasks = JSON.parse(text);
            updateStorage();
            renderTasks();
            importInput.value = '';
        }
    });
}

// Evento para agregar nueva tarea
addTaskButton.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text !== '') {
        const newTask = {
            text,
            // Si estamos en la página de completadas se agrega como finalizada
            completed: isCompletedPage
        };
        tasks.push(newTask);
        updateStorage();
        renderTasks();
        taskInput.value = '';
    }
});

taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        addTaskButton.click();
    }
});

// Funciones auxiliares
function updateStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showToast(message, undoCallback) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message + ' ';
    if (undoCallback) {
        const undo = document.createElement('button');
        undo.textContent = 'Deshacer';
        undo.addEventListener('click', () => {
            undoCallback();
            document.body.removeChild(toast);
        });
        toast.appendChild(undo);
    }
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) {
            document.body.removeChild(toast);
        }
    }, 3000);
}

function renderTasks() {
    if (tasksList) tasksList.innerHTML = '';
    if (pendingList) pendingList.innerHTML = '';
    if (completedList) completedList.innerHTML = '';

    const filtered = tasks.filter(t => t.text.toLowerCase().includes(searchQuery));
    filtered.forEach(task => {
        const index = tasks.indexOf(task);
        const createItem = () => {
            const li = document.createElement('li');
            li.draggable = true;
            li.addEventListener('dragstart', () => draggedIndex = index);
            li.addEventListener('dragover', e => e.preventDefault());
            li.addEventListener('drop', () => {
                const targetIndex = tasks.indexOf(task);
                const temp = tasks[draggedIndex];
                tasks[draggedIndex] = tasks[targetIndex];
                tasks[targetIndex] = temp;
                updateStorage();
                renderTasks();
            });

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
                const removed = tasks.splice(index, 1)[0];
                updateStorage();
                renderTasks();
                showToast('Tarea borrada', () => {
                    tasks.splice(index, 0, removed);
                    updateStorage();
                    renderTasks();
                });
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
    const pending = tasks.length - completed;
    progressDisplay.textContent = `Progreso: ${completed} / ${tasks.length}`;
    if (navAll) navAll.innerText = `Todas ${tasks.length}`;
    if (navPending) navPending.innerText = `Pendientes ${pending}`;
    if (navCompleted) navCompleted.innerText = `Completadas ${completed}`;
}
