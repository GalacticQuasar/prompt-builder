# Prompt Builder

A simple, browser-based tool for creating, managing, and organizing text prompts with automatic saving functionality.

Example Usages:
- Resume + Job Listing + "Reply to this short answer job application question" -> Tailored short answer response for job application
- Homework Question + Student Solution + "Thoroughly the student's solution for correctness" -> Homework Response Verifier

## Features

- Create and manage multiple text prompts in a clean interface
- Auto-save functionality using browser's localStorage
- Copy all prompts to clipboard with a single click
- Delete individual prompts
- Clear all prompts with confirmation
- Responsive design with Tailwind CSS
- Visual feedback for save and copy operations

## Usage

1. Open `index.html` in a web browser
2. Click "Add Prompt" to create a new text area
3. Type or paste your prompt text into the text area
4. Changes are automatically saved to localStorage
5. Use the copy button to copy all prompts to clipboard
6. Use the × button next to each prompt to delete it
7. Use "Clear All" to remove all prompts (requires confirmation)

## Technical Details

- Built with vanilla JavaScript and HTML
- Styled using Tailwind CSS (via CDN)
- Uses browser's localStorage for data persistence
- No server or installation required
- Mobile-responsive design

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. Start creating and managing your prompts!

## Browser Support

Works in all modern browsers that support:
- localStorage
- Clipboard API
- ES6+ JavaScript features
