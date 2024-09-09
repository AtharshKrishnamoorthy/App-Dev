let tasks = [];
let taskId = 0;

// Add Task
function addTask() {
    const taskInput = document.getElementById('taskInput').value;
    const deadline = document.getElementById('taskDeadline').value;
    const priority = document.getElementById('taskPriority').value;

    if (taskInput === '') {
        alert('Please enter a task');
        return;
    }

    const task = {
        id: taskId++,
        name: taskInput,
        status: 'pending',
        deadline: deadline,
        priority: priority,
        createdAt: new Date()
    };
    
    tasks.push(task);
    updateTaskList();
}

// Update Task List
function updateTaskList(filteredTasks = tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    const statusFilter = document.querySelector('button.active-status')?.dataset.status || 'all';
    const priorityFilter = document.querySelector('button.active-priority')?.dataset.priority || 'all';

    filteredTasks = filteredTasks.filter(task => 
        (statusFilter === 'all' || task.status === statusFilter) &&
        (priorityFilter === 'all' || task.priority === priorityFilter)
    );

    // Sort tasks by priority: high -> medium -> low
    filteredTasks.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    filteredTasks.forEach(task => {
        const taskElement = document.createElement('li');
        taskElement.className = task.status;
        taskElement.innerHTML = `
            <span>${task.name} (Due: ${task.deadline || 'No deadline'}) - ${task.priority} Priority</span>
            <select onchange="updateTaskStatus(${task.id}, this.value)">
                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="started" ${task.status === 'started' ? 'selected' : ''}>Started</option>
                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
            <button class="delete-task" onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(taskElement);
    });

    updateCharts(filteredTasks);  // Pass filteredTasks to updateCharts
}

// Update Task Status
function updateTaskStatus(id, status) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.status = status;
        }
        return task;
    });
    updateTaskList();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    updateTaskList();
}

// Search Tasks
function searchTasks() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(searchInput));
    updateTaskList(filteredTasks);
}

// Filter Tasks by Status
function filterTasks(status) {
    const buttons = document.querySelectorAll('.filter-section button[data-status]');
    buttons.forEach(button => button.classList.remove('active-status'));
    document.querySelector(`.filter-section button[data-status="${status}"]`)?.classList.add('active-status');
    
    // Filter tasks based on status
    const filteredTasks = tasks.filter(task => status === 'all' || task.status === status);
    updateTaskList(filteredTasks);
}

// Filter Tasks by Priority
function filterByPriority(priority) {
    const buttons = document.querySelectorAll('.filter-section button[data-priority]');
    buttons.forEach(button => button.classList.remove('active-priority'));
    document.querySelector(`.filter-section button[data-priority="${priority}"]`)?.classList.add('active-priority');
    
    // Filter tasks based on priority
    const filteredTasks = tasks.filter(task => priority === 'all' || task.priority === priority);
    updateTaskList(filteredTasks);
}

// Update Charts
function updateCharts(filteredTasks = tasks) {
    updatePieChart(filteredTasks);
    updateBarChart(filteredTasks);
    updateLineChart(filteredTasks);
}

// Update Pie Chart
function updatePieChart(filteredTasks) {
    const ctx = document.getElementById('taskPieChart').getContext('2d');
    
    const statusCounts = filteredTasks.reduce((counts, task) => {
        counts[task.status] = (counts[task.status] || 0) + 1;
        return counts;
    }, {});

    const chartData = {
        labels: ['Pending', 'Started', 'Completed'],
        datasets: [{
            data: [
                statusCounts['pending'] || 0,
                statusCounts['started'] || 0,
                statusCounts['completed'] || 0
            ],
            backgroundColor: ['#ffefc7', '#c7e1ff', '#d2f4e7']
        }]
    };

    if (window.pieChart) {
        window.pieChart.destroy();
    }

    window.pieChart = new Chart(ctx, {
        type: 'pie',
        data: chartData
    });
}

// Update Bar Chart
function updateBarChart(filteredTasks) {
    const ctx = document.getElementById('taskBarChart').getContext('2d');
    
    const priorityCounts = filteredTasks.reduce((counts, task) => {
        counts[task.priority] = (counts[task.priority] || 0) + 1;
        return counts;
    }, {});

    const chartData = {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
            label: 'Priority Count',
            data: [
                priorityCounts['low'] || 0,
                priorityCounts['medium'] || 0,
                priorityCounts['high'] || 0
            ],
            backgroundColor: ['#ffcccb', '#ffb3e6', '#c2c2f0']
        }]
    };

    if (window.barChart) {
        window.barChart.destroy();
    }

    window.barChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update Line Chart
function updateLineChart(filteredTasks) {
    const ctx = document.getElementById('taskLineChart').getContext('2d');
    
    const dailyCounts = filteredTasks.reduce((counts, task) => {
        const date = task.createdAt.toISOString().split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
        return counts;
    }, {});

    const chartData = {
        labels: Object.keys(dailyCounts).sort(),
        datasets: [{
            label: 'Tasks Created Per Day',
            data: Object.values(dailyCounts).sort((a, b) => new Date(a) - new Date(b)),
            fill: false,
            borderColor: '#ff7f7f'
        }]
    };

    if (window.lineChart) {
        window.lineChart.destroy();
    }

    window.lineChart = new Chart(ctx, {
        type: 'line',
        data: chartData
    });
}

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});
