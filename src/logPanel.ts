import * as vscode from 'vscode';

export class LogPanel {
  private readonly logPanel: vscode.OutputChannel;
  private readonly compilerLogPanel: vscode.OutputChannel;
  readonly status: vscode.StatusBarItem;

  constructor() {
    this.logPanel = vscode.window.createOutputChannel('Quartus Workbench');
    this.compilerLogPanel = vscode.window.createOutputChannel('Quartus Compiler');
    this.compilerLogPanel.append('Ready');
    this.status = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      -10000
    );
    // this.status.command = 'quartusprime.actions';
    this.status.show();
    this.displayStatus('check', 'statusBar.foreground');
  }

  addLogMessage(message: string) {
    this.logPanel.append(
    `[${new Date().toLocaleTimeString('en-US', {
        hour12: false,
    })}] ${message}\n`
    );
  }

  logCommand(message: string, command: string, args: string[] = []) {
    this.addLogMessage(message + ': ' + command);
    this.addLogMessage(message + ' args: ' + JSON.stringify(args));
  }

  addCompilerMessage(message: string) {
    this.compilerLogPanel.append(message);
  }

  logError(e: Error) {
    this.addLogMessage(e.message);
    if (e.stack) {
      this.addLogMessage(e.stack);
    }
  }

  logOnRejected(e: unknown) {
    if (e instanceof Error) {
      this.logError(e);
    } else {
      this.addLogMessage(String(e));
    }
  }

  clearCompilerMessage() {
    this.compilerLogPanel.clear();
  }

  displayStatus(
    icon: string,
    color: string,
    message: string | undefined = undefined,
    severity: 'info' | 'warning' | 'error' = 'info',
    build: string = ''
  ) {
    this.status.text = `$(${icon})${build}`;
    this.status.tooltip = message;
    this.status.color = new vscode.ThemeColor(color);
    if (message === undefined) {
      return;
    }
    switch (severity) {
      case 'info':
          vscode.window.showInformationMessage(message);
        break;
      case 'warning':
          vscode.window.showWarningMessage(message);
        break;
      case 'error':
      default:
          vscode.window.showErrorMessage(message);
        break;
    }
  }

  showErrorMessage(
    message: string,
    ...args: string[]
  ): Thenable<string | undefined> | undefined {
    return vscode.window.showErrorMessage(message, ...args);
  }

  showErrorMessageWithCompilerLogButton(message: string) {
    const res = this.showErrorMessage(message, 'Open compiler log');
    if (res) {
      return res.then((option) => {
        switch (option) {
          case 'Open compiler log': {
            this.showCompilerLog();
            break;
          }
          default: {
            break;
          }
        }
      });
    }
    return;
  }

  showErrorMessageWithExtensionLogButton(message: string) {
    const res = this.showErrorMessage(message, 'Open Quartus Workbench log');
    if (res) {
      return res.then((option) => {
        switch (option) {
          case 'Open Quartus Workbench log': {
            this.showLog();
            break;
          }
          default: {
            break;
          }
        }
      });
    }
    return;
  }

  showLog() {
    this.logPanel.show();
  }

  showCompilerLog() {
    this.compilerLogPanel.show();
  }
}
