
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
let currentFilter = 'all';

/*  SELECTORS  */
const taskInput = document.getElementById('taskInput');
const addBtn    = document.getElementById('addBtn');
const taskList  = document.getElementById('taskList');
const clearBtn  = document.getElementById('clearBtn');
const tabs      = document.querySelectorAll('.tab');

const statTotal   = document.getElementById('stat-total');
const statDone    = document.getElementById('stat-done');
const statPending = document.getElementById('stat-pending');

/*  SAVE — write tasks array to localStorage */
function save() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

/*  UPDATE STATS — update the 3 number cards at the top */
function updateStats() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.completed).length;
  const pending = total - done;

  statTotal.textContent   = total;
  statDone.textContent    = done;
  statPending.textContent = pending;
}

/* ESCAPE HTML — prevent XSS when rendering task text */
function escapeHtml(str) {
   if (!str) return '';
   return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
}

/* RENDER — build the task list based on current filter */
function render() {
  // Filter tasks based on selected tab
  const filtered = tasks.filter(t => {
    if (currentFilter === 'completed') return t.completed;
    if (currentFilter === 'pending')   return !t.completed;
    return true; // 'all'
  });

  // Show empty state if no tasks match
  if (filtered.length === 0) {
    const emptyMessages = {
      all:       { icon: '📋', text: 'No tasks yet! Add one above.' },
      pending:   { icon: '✅', text: 'No pending tasks. Great job!' },
      completed: { icon: '🎯', text: 'No completed tasks yet.' }
    };
    const msg = emptyMessages[currentFilter];
    taskList.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${msg.icon}</div>
        <p>${msg.text}</p>
      </div>
    `;
    updateStats();
    return;
  }

  // Build HTML for each task
  taskList.innerHTML = filtered.map(t => `
    <div class="task-item ${t.completed ? 'completed' : ''}" id="task-${t.id}">

      <!-- Checkbox button to toggle complete -->
      <button
        class="check-btn"
        onclick="toggleTask(${t.id})"
        title="${t.completed ? 'Mark as pending' : 'Mark as done'}"
        aria-label="${t.completed ? 'Mark as pending' : 'Mark as done'}"
      >
        ${t.completed ? '✓' : ''}
      </button>

      <!-- Task text -->
      <span class="task-text">${escapeHtml(t.text)}</span>

      <!-- Delete button -->
      <button
        class="del-btn"
        onclick="deleteTask(${t.id})"
        title="Delete task"
        aria-label="Delete task"
      >
        🗑
      </button>

    </div>
  `).join('');

  updateStats();
}

/*  ADD TASK — create a new task and prepend it to the list */
function addTask() {
  const text = taskInput.value.trim();

  // Do nothing if input is empty
  if (!text) {
    taskInput.focus();
    taskInput.style.borderColor = 'var(--red)';
    setTimeout(() => { taskInput.style.borderColor = ''; }, 800);
    return;
  }

  // Create new task object
  const newTask = {
    id: Date.now(),  
    text:text,      
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask); 
  save();
  render();

  // Clear and refocus input
  taskInput.value = '';
  taskInput.focus();
}

/* TOGGLE TASK — mark as done or pending */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    save();
    render();
  }
}

/* DELETE TASK — remove a task by id */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

/*  CLEAR COMPLETED — remove all completed tasks at once */
function clearCompleted() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) return; // nothing to clear

  const confirmed = confirm(`Delete ${completedCount} completed task(s)?`);
  if (confirmed) {
    tasks = tasks.filter(t => !t.completed);
    save();
    render();
  }
}

/* SET FILTER — switch between All / Pending / Completed */
function setFilter(filterValue) {
  currentFilter = filterValue;

  // Update active tab style
  tabs.forEach(tab => {
    if (tab.dataset.filter === filterValue) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  render();
}

/* EVENT LISTENERS */

// Add button click
addBtn.addEventListener('click', addTask);

// Enter key in input
taskInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTask();
});

// Filter tab clicks
tabs.forEach(tab => {
  tab.addEventListener('click', function() {
    setFilter(this.dataset.filter);
  });
});

// Clear completed button
clearBtn.addEventListener('click', clearCompleted);

/* INIT — render on page load
    */
render();