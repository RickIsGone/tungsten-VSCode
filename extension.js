const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
   // Register the build command
   let buildCmd = vscode.commands.registerCommand('tungsten.build', () => {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders) {
         vscode.window.showErrorMessage('No folder is opened');
         return;
      }
      const rootPath = folders[0].uri.fsPath;
      const buildTgsPath = path.join(rootPath, 'build.tgs');
      const hasBuildTgs = fs.existsSync(buildTgsPath);
      let cmd = '';
      if (hasBuildTgs) {
         cmd = `tungsten build-tgs`;
      } else {
         const activeFile = vscode.window.activeTextEditor?.document.fileName;
         if (!activeFile) {
            vscode.window.showErrorMessage('No active file to build');
            return;
         }
         cmd = `tungsten "${activeFile}"`;
      }
      const terminal = vscode.window.createTerminal('Tungsten Build');
      terminal.show();
      terminal.sendText(cmd);
   });

   // Register the run command (builds then runs)
   let runCmd = vscode.commands.registerCommand('tungsten.run', () => {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders) {
         vscode.window.showErrorMessage('No folder is opened');
         return;
      }
      const rootPath = folders[0].uri.fsPath;
      const buildTgsPath = path.join(rootPath, 'build.tgs');
      const hasBuildTgs = fs.existsSync(buildTgsPath);

      let buildCmd = '';
      if (hasBuildTgs) {
         buildCmd = `tungsten build.tgs`;
      } else {
         const activeFile = vscode.window.activeTextEditor?.document.fileName;
         if (!activeFile) {
            vscode.window.showErrorMessage('No active file to build');
            return;
         }
         buildCmd = `tungsten "${activeFile}"`;
      }

      const activeFile = vscode.window.activeTextEditor.document.fileName;
      // Assume executable has the same filename without .tgs extension
      const execFile = activeFile.replace(/\.tgs$/, '');

      const terminal = vscode.window.createTerminal('Tungsten Build + Run');
      terminal.show();
      terminal.sendText(buildCmd);
      terminal.sendText(execFile);
   });

   context.subscriptions.push(buildCmd);
   context.subscriptions.push(runCmd);

   // Add a status bar Play button that runs the 'tungsten.run' command
   const playButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
   playButton.command = 'tungsten.run';
   playButton.text = '▶ Play';
   playButton.tooltip = 'Build and Run Tungsten project/file';
   playButton.show();

   context.subscriptions.push(playButton);
}

function deactivate() { }

module.exports = {
   activate,
   deactivate
};
