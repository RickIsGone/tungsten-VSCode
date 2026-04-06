const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// Shared terminal reference
let tungstenTerminal = null;

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
      let workingDir = rootPath;
      if (hasBuildTgs) {
         cmd = `tungsten build-tgs`;
      } else {
         const activeFile = vscode.window.activeTextEditor?.document.fileName;
         if (!activeFile) {
            vscode.window.showErrorMessage('No active file to build');
            return;
         }
         workingDir = path.dirname(activeFile);
         const fileName = path.basename(activeFile);
         cmd = `tungsten "${fileName}"`;
      }

      // Reuse existing terminal or create new one
      if (!tungstenTerminal || tungstenTerminal.exitStatus !== undefined) {
         tungstenTerminal = vscode.window.createTerminal('Tungsten');
      }
      tungstenTerminal.show();

      // Clear terminal if setting is enabled
      const config = vscode.workspace.getConfiguration('tungsten');
      if (config.get('clearTerminalBeforeRun', false)) {
         const clearCmd = process.platform === 'win32' ? 'cls' : 'clear';
         tungstenTerminal.sendText(clearCmd);
      }

      // Set optimization level
      cmd = cmd + ` -${config.get('defaultOptimizationLevel')}`;

      // Save file if setting is enabled
      if (config.get('saveBeforeBuild')) {
         vscode.window.activeTextEditor.document.save();
      }

      tungstenTerminal.sendText(`cd "${workingDir}" && ${cmd}`);
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
      let workingDir = rootPath;
      if (hasBuildTgs) {
         buildCmd = `tungsten build-tgs`;
      } else {
         const activeFile = vscode.window.activeTextEditor?.document.fileName;
         if (!activeFile) {
            vscode.window.showErrorMessage('No active file to build');
            return;
         }
         workingDir = path.dirname(activeFile);
         const fileName = path.basename(activeFile);
         buildCmd = `tungsten "${fileName}"`;
      }

      const activeFile = vscode.window.activeTextEditor?.document.fileName;
      if (!activeFile) {
         vscode.window.showErrorMessage('No active file to run');
         return;
      }
      // Assume executable has the same filename without .tgs extension
      let execFile = path.basename(activeFile).replace(/\.tgs$/, '');

      // Add .exe extension on Windows
      if (process.platform === 'win32') {
         execFile += '.exe';
      }

      // Build run command based on platform
      let runCmd = '';

      if (process.platform === 'win32') {
         runCmd = `.\\${execFile}`;
      } else {
         runCmd = `./"${execFile}"`;
      }

      // Reuse existing terminal or create new one
      if (!tungstenTerminal || tungstenTerminal.exitStatus !== undefined) {
         tungstenTerminal = vscode.window.createTerminal('Tungsten');
      }
      tungstenTerminal.show();

      // Clear terminal if setting is enabled
      const config = vscode.workspace.getConfiguration('tungsten');
      if (config.get('clearTerminalBeforeRun', false)) {
         const clearCmd = process.platform === 'win32' ? 'cls' : 'clear';
         tungstenTerminal.sendText(clearCmd);
      }

      // Set optimization level
      buildCmd = buildCmd + ` -${config.get('defaultOptimizationLevel')}`;

      // Save file if setting is enabled
      if (config.get('saveBeforeBuild')) {
         vscode.window.activeTextEditor.document.save();
      }
      // Combine both commands on the same line
      tungstenTerminal.sendText(`cd "${workingDir}" && ${buildCmd} && ${runCmd}`);
   });

   context.subscriptions.push(buildCmd);
   context.subscriptions.push(runCmd);

   // Clean up terminal reference when it is closed
   context.subscriptions.push(vscode.window.onDidCloseTerminal(terminal => {
      if (terminal === tungstenTerminal) {
         tungstenTerminal = null;
      }
   }));

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
