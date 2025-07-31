# Tungsten VS Code Extension

This extension provides support for the **Tungsten** programming language in Visual Studio Code, including build and run commands, keyboard shortcuts, and a convenient Play button.

---

## Features

- Build Tungsten files or projects
- Run Tungsten executables with a single command
- Detects presence of a `build.tgs` file in the workspace root:
  - If found, runs `tungsten build-tgs` to build the whole project using the build system.
  - If not found, builds only the currently active `.tgs` file using `tungsten <filename>`.
- Status bar **Play** button to quickly build and run the project or active file.
- Keyboard shortcuts:
  - `F7` to build
  - `Ctrl + F5` to build and run

---

## Commands

| Command ID          | Description                    | Default Shortcut   |
| ------------------- | ------------------------------| ------------------ |
| `tungsten.build`    | Build Tungsten project or file | `F7`               |
| `tungsten.run`      | Build and run Tungsten         | `Ctrl + F5`        |

---

## Usage

1. Open a folder containing your Tungsten source files (`.tgs`).
2. If your project has a `build.tgs` file in the root directory, the build commands will use it automatically.
3. Otherwise, building will compile the currently active `.tgs` file.
4. Use the **Play** button in the status bar or the keyboard shortcuts to build and run your code quickly.

---

## Installation

- Install from the VS Code Marketplace
- open the VS Code extension bar and look for Tungsten
- Clone the repository and run your extension in development mode.

---

## Development

The extension is implemented in JavaScript using the VS Code Extension API. The main logic is in `extension.js` which registers commands and the status bar button.

---

## Known Issues

- Currently, no integrated debugging support.
- Assumes executable has the same filename as source but without `.tgs` extension.
