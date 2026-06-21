# Task Manager

A modern, fully-featured task manager web application built with vanilla JavaScript, HTML5, and CSS3.

## Features

- ✨ **Add, Delete & Complete Tasks** - Full task management capabilities
- 🎨 **Dark Mode Toggle** - System preference detection + manual toggle with persistence
- 🔍 **Smart Filtering** - View All, Pending, or Completed tasks with button-based filters
- 💾 **Data Persistence** - Tasks saved to localStorage automatically
- ♿ **Fully Accessible** - WCAG compliant with comprehensive ARIA labels and screen reader support
- 📱 **Responsive Design** - Works seamlessly on mobile (480px+), tablet, and desktop
- ⌨️ **Keyboard Friendly** - Full keyboard navigation and focus management
- ✅ **Input Validation** - Real-time validation with helpful error messages
- 📊 **Live Statistics** - Task count tracking (Total, Active, Completed)
- 🎯 **Clean UI** - Modern design with smooth transitions and animations

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required!

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/task-manager.git
cd task-manager
```

2. Open in your browser:
```bash
# Simply open index.html in your web browser
# Or use a local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

## Usage

1. **Add a Task**: Type in the input field and click "Add Task" or press Enter
2. **Complete a Task**: Click the checkbox next to a task
3. **Delete a Task**: Click the × button on the right side of a task
4. **Filter Tasks**: Use the filter buttons to show All, Pending, or Completed tasks
5. **Clear Completed**: Remove all completed tasks at once
6. **Toggle Dark Mode**: Click the theme toggle button in the header

## Project Structure

```
task-manager/
├── index.html          # Semantic HTML markup
├── styles.css          # Modern CSS with variables and dark mode
├── script.js           # JavaScript logic (TaskManager & ThemeManager classes)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Accessibility

This project is built with accessibility as a priority:
- Semantic HTML5 elements
- ARIA labels and live regions for screen readers
- Keyboard navigation support
- Focus indicators and visual feedback
- Color contrast ratios compliant with WCAG AA standards
- Support for system dark mode preference

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE 11: ❌ Not supported (ES6+ features used)

## Features in Detail

### Dark Mode
- Automatically detects system preference
- Manual toggle button in header (☀️🌙)
- Preference persists across sessions
- Smooth transitions between themes

### Input Validation
- Real-time validation as you type
- Submit button disabled for invalid input
- Visual feedback for empty input (orange border)
- Character limit: 100 characters per task
- Warning at 80% capacity

### Data Persistence
- All tasks saved to browser's localStorage
- Automatic save on every change
- Loads previous tasks on page refresh
- Error handling for storage issues

### Filtering System
- Three filter states: All, Pending, Completed
- Button-based filters with active state styling
- Maintains current filter while editing tasks
- Real-time statistics update

## Code Quality

- **Architecture**: Class-based with separation of concerns (TaskManager, ThemeManager)
- **Error Handling**: Try-catch blocks for storage operations
- **Performance**: Efficient DOM manipulation and event delegation
- **Styling**: CSS custom properties for maintainability and theming

## Future Enhancements

- [ ] Task categories/tags
- [ ] Due dates and reminders
- [ ] Task priority levels
- [ ] Cloud sync (Firebase, etc.)
- [ ] Drag-and-drop reordering
- [ ] Recurring tasks
- [ ] Task notes/descriptions

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to fork, make improvements, and submit pull requests!

## Author

Created with ❤️ for productivity

---

**Try it out**: Open `index.html` in your browser and start managing your tasks!
