# Prompt Builder

A simple, browser-based tool for creating, managing, and organizing text prompts with automatic saving functionality and persistent configuration storage.

Example Usages:
- Resume + Job Listing + "Reply to this short answer job application question" -> Tailored short answer response for job application
- Homework Question + Student Solution + "Thoroughly check the student's solution for correctness" -> Homework Response Verifier

## Features

- Create and manage multiple text prompts in a clean interface
- Auto-save functionality using browser's localStorage for current session
- **Save and load named prompt configurations** using IndexedDB for persistent storage
- Copy all prompts to clipboard with a single click
- Delete individual prompts
- Clear all prompts with confirmation
- **Configuration management sidebar** with save, load, and delete operations
- Responsive design with DaisyUI components
- Visual feedback for save and copy operations
- **Persistent storage** that survives browser sessions and data clearing

## Usage

### Basic Operations
1. Open `index.html` in a web browser
2. Click "Add Prompt" to create a new text area
3. Type or paste your prompt text into the text area
4. Changes are automatically saved to localStorage for the current session
5. Use the copy button to copy all prompts to clipboard
6. Use the × button next to each prompt to delete it
7. Use "Clear All" to remove all prompts (requires confirmation)

### Configuration Management
1. Click "Configurations" to open the sidebar
2. Enter a name for your current prompt set and click "Save" to store it permanently
3. View all saved configurations in the sidebar with creation dates and prompt counts
4. Click "Load" on any saved configuration to restore those prompts
5. Click "Delete" to permanently remove a saved configuration
6. Saved configurations persist across browser sessions and survive data clearing

## Technical Details

- Built with vanilla JavaScript and HTML
- Styled using DaisyUI + Tailwind CSS (via CDN)
- Uses browser's localStorage for auto-save functionality
- **Uses IndexedDB for persistent configuration storage**
- Drawer-based sidebar interface for configuration management
- No server or installation required
- Mobile-responsive design with collapsible sidebar

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. Start creating and managing your prompts!

## Browser Support

Works in all modern browsers that support:
- localStorage
- **IndexedDB** (for persistent configuration storage)
- Clipboard API
- ES6+ JavaScript features (async/await, Promises)

## Data Storage

The app uses two storage mechanisms:
- **localStorage**: Auto-saves current prompts for session continuity
- **IndexedDB**: Stores named configurations permanently with timestamps and metadata

Configurations saved in IndexedDB will persist even if localStorage is cleared or the browser cache is reset.
