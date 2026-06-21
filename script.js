/**
 * Task Manager Application
 * Provides functionality to add, delete, and mark tasks as completed
 */

class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.maxTaskLength = 100;
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.validateInput();
        this.render();
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.form = document.getElementById('task-form');
        this.taskInput = document.getElementById('task-input');
        this.taskList = document.getElementById('task-list');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clear-completed-btn');
        this.submitBtn = this.form.querySelector('button[type="submit"]');
        this.emptyState = document.getElementById('empty-state');
        this.taskListContainer = document.getElementById('task-list-container');
        this.totalCount = document.getElementById('total-count');
        this.activeCount = document.getElementById('active-count');
        this.completedCount = document.getElementById('completed-count');
        this.charCount = document.getElementById('char-count');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleAddTask(e));
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        this.clearCompletedBtn.addEventListener('click', () => this.handleClearCompleted());
        this.taskInput.addEventListener('input', () => {
            this.updateCharCount();
            this.validateInput();
        });
    }

    /**
     * Handle form submission - add new task
     */
    handleAddTask(e) {
        e.preventDefault();

        const taskText = this.taskInput.value.trim();

        // Validate input is not empty
        if (!this.isValidTaskInput(taskText)) {
            this.showError('Please enter a valid task (cannot be empty or whitespace only)');
            this.taskInput.focus();
            return;
        }

        // Validate length constraints
        if (taskText.length > this.maxTaskLength) {
            this.showError(`Task must be ${this.maxTaskLength} characters or less`);
            return;
        }

        const task = {
            id: this.generateId(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.updateCharCount();
        this.validateInput();
        this.render();
        this.taskInput.focus();

        // Announce to screen readers
        this.announce(`Task added: ${taskText}`);
    }

    /**
     * Validate task input
     */
    isValidTaskInput(taskText) {
        // Check if text is empty or only whitespace
        if (!taskText || taskText.trim().length === 0) {
            return false;
        }
        // Check minimum length (at least 1 character after trim)
        if (taskText.length === 0) {
            return false;
        }
        return true;
    }

    /**
     * Real-time input validation - enable/disable submit button
     */
    validateInput() {
        const taskText = this.taskInput.value.trim();
        const isValid = this.isValidTaskInput(taskText) && taskText.length <= this.maxTaskLength;

        if (isValid) {
            this.submitBtn.disabled = false;
            this.taskInput.setAttribute('aria-invalid', 'false');
        } else {
            this.submitBtn.disabled = true;
            if (!taskText) {
                this.taskInput.setAttribute('aria-invalid', 'true');
            }
        }
    }

    /**
     * Handle filter button click
     */
    handleFilterClick(e) {
        const filterValue = e.target.dataset.filter;
        this.currentFilter = filterValue;

        // Update button states
        this.filterBtns.forEach(btn => {
            if (btn.dataset.filter === filterValue) {
                btn.classList.add('filter-btn-active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('filter-btn-active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        this.render();
    }

    /**
     * Handle task completion toggle
     */
    handleToggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();

            const status = task.completed ? 'marked as completed' : 'marked as incomplete';
            this.announce(`Task ${status}: ${task.text}`);
        }
    }

    /**
     * Handle task deletion
     */
    handleDeleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const taskText = task.text;
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();

        this.announce(`Task deleted: ${taskText}`);
    }

    /**
     * Handle clear all completed tasks
     */
    handleClearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;

        if (completedCount === 0) return;

        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();

            this.announce(`${completedCount} completed task(s) deleted`);
        }
    }

    /**
     * Get filtered tasks based on current filter
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    /**
     * Update task statistics
     */
    updateStats() {
        const total = this.tasks.length;
        const active = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;

        this.totalCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;

        // Update clear completed button state
        this.clearCompletedBtn.disabled = completed === 0;
    }

    /**
     * Render the task list
     */
    render() {
        this.taskList.innerHTML = '';
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            this.emptyState.style.display = 'block';
        } else {
            this.emptyState.style.display = 'none';
            filteredTasks.forEach((task, index) => {
                const li = this.createTaskElement(task, index);
                this.taskList.appendChild(li);
            });
        }

        this.updateStats();
    }

    /**
     * Create a task list item element
     */
    createTaskElement(task, index) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('role', 'listitem');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', `Mark task as ${task.completed ? 'incomplete' : 'complete'}: ${task.text}`);
        checkbox.addEventListener('change', () => this.handleToggleComplete(task.id));

        const content = document.createElement('div');
        content.className = 'task-content';

        const text = document.createElement('span');
        text.className = 'task-text';
        text.textContent = task.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger task-delete';
        deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
        deleteBtn.innerHTML = '<span aria-hidden="true">×</span>';
        deleteBtn.addEventListener('click', () => this.handleDeleteTask(task.id));

        content.appendChild(text);
        li.appendChild(checkbox);
        li.appendChild(content);
        li.appendChild(deleteBtn);

        return li;
    }

    /**
     * Update character count for input
     */
    updateCharCount() {
        const length = this.taskInput.value.length;
        this.charCount.textContent = `${length}/${this.maxTaskLength} characters`;

        if (length > this.maxTaskLength * 0.8) {
            this.charCount.classList.add('warning');
            this.charCount.classList.remove('error');
        } else if (length > this.maxTaskLength) {
            this.charCount.classList.add('error');
            this.charCount.classList.remove('warning');
        } else {
            this.charCount.classList.remove('warning', 'error');
        }
    }

    /**
     * Save tasks to local storage
     */
    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Failed to save tasks:', e);
            this.showError('Failed to save tasks. Please try again.');
        }
    }

    /**
     * Load tasks from local storage
     */
    loadTasks() {
        try {
            const stored = localStorage.getItem('tasks');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load tasks:', e);
            return [];
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Show error message
     */
    showError(message) {
        // Use the native browser method if available
        if (this.taskInput.setCustomValidity) {
            this.taskInput.setCustomValidity(message);
            this.taskInput.reportValidity();
            this.taskInput.setCustomValidity('');
        }
    }

    /**
     * Announce message to screen readers
     */
    announce(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }
}

/**
 * Theme Manager - Handles dark/light mode toggle
 */
class ThemeManager {
    constructor() {
        this.storageKey = 'theme-preference';
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.querySelector('.theme-icon');
        this.lightIcon = '☀️';
        this.darkIcon = '🌙';
        this.init();
    }

    /**
     * Initialize theme manager
     */
    init() {
        this.applyStoredTheme();
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.updateIcon();
    }

    /**
     * Apply theme from localStorage or system preference
     */
    applyStoredTheme() {
        const html = document.documentElement;
        const savedTheme = localStorage.getItem(this.storageKey);

        if (savedTheme) {
            // Use saved preference
            if (savedTheme === 'dark') {
                html.classList.add('dark-mode');
                html.classList.remove('light-mode');
            } else {
                html.classList.add('light-mode');
                html.classList.remove('dark-mode');
            }
        } else {
            // Check system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                html.classList.add('dark-mode');
                html.classList.remove('light-mode');
            } else {
                html.classList.add('light-mode');
                html.classList.remove('dark-mode');
            }
        }
    }

    /**
     * Toggle between dark and light mode
     */
    toggleTheme() {
        const html = document.documentElement;
        const isDarkMode = html.classList.contains('dark-mode');

        if (isDarkMode) {
            // Switch to light mode
            html.classList.add('light-mode');
            html.classList.remove('dark-mode');
            localStorage.setItem(this.storageKey, 'light');
        } else {
            // Switch to dark mode
            html.classList.add('dark-mode');
            html.classList.remove('light-mode');
            localStorage.setItem(this.storageKey, 'dark');
        }

        this.updateIcon();
    }

    /**
     * Update toggle button icon based on current theme
     */
    updateIcon() {
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        this.themeIcon.textContent = isDarkMode ? this.lightIcon : this.darkIcon;
    }
}

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new TaskManager();
});
