import { LogPanel } from './logPanel';
import { TclCommandExecuter } from './tclCommandExec';
import { ActionButtonItem } from './actionsList';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { WorkbenchQuartusActionItemView } from './actionsList';
import { WorkbenchQuartusIOItemsView } from './IOItemsList';
import {
  SourceFileView,
  WorkbenchQuartusSourceFilesView,
} from './vhdlFilesList';
import * as path from 'path';
import * as fs from 'fs';
import { Uri } from 'vscode';
import { TaskService } from './tasks';

export const PROJECT_INFO_FOLDER = 'metadata';

class StatusBar {
  private _actual: vscode.StatusBarItem;
  private _lastText: string | undefined;

  constructor() {
    this._actual = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    this._actual.show();
  }

  public setText(text: string): void {
    if (this._lastText === text) {
      return;
    }
    this._lastText = text;
    this._actual.text = this._lastText;
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "quartusprime" is now active!');
  new Extension(context)
    .registerCommands()
    .registerViews()
    .registerTasks();
}

// this method is called when your extension is deactivated
export function deactivate() {}

export class Extension {
  private _extensionPath: string | undefined;
  private _workspacePath: string | undefined;
  private _quartusPrimePath: string | undefined;
  private _projectName: string | undefined;
  private workbenchIOitems: WorkbenchQuartusIOItemsView;
  private workbenchSourceFiles: WorkbenchQuartusSourceFilesView;
  private workbenchActions: WorkbenchQuartusActionItemView;
  private tclService: TclCommandExecuter;
  private taskService: TaskService;

  public logger: LogPanel;
  public statusBar: StatusBar;

  constructor(private context: vscode.ExtensionContext) {
    const rootPath =
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;
    console.log(rootPath);
    this._workspacePath = rootPath;

    const extensionPath = vscode.extensions.getExtension(
      'elemeants.quartusprime'
    )?.extensionUri.fsPath;
    console.log(extensionPath);
    this._extensionPath = extensionPath;

    const quartusPrimePath = vscode.workspace
      .getConfiguration('quartusprime')
      .get<string>('quartusInstallPath');
    console.log(quartusPrimePath);
    this._quartusPrimePath = quartusPrimePath;

    const projectName = this.updateProjectName();
    console.log(projectName);
    this._projectName = projectName;

    this.logger = new LogPanel();
    this.statusBar = new StatusBar();

    this.taskService = new TaskService(this);
    this.workbenchIOitems = new WorkbenchQuartusIOItemsView(rootPath);
    this.workbenchSourceFiles = new WorkbenchQuartusSourceFilesView(rootPath);
    this.workbenchActions = new WorkbenchQuartusActionItemView();
    this.tclService = new TclCommandExecuter(this);
  }

  private updateProjectName() {
    let projectName = undefined;
    if (this._workspacePath) {
      const qsfFile = fs
        .readdirSync(this._workspacePath)
        .find((file) => file.endsWith('.qsf'));
      if (qsfFile) {
        projectName = path.basename(qsfFile).split('.')[0];
      }
    }
    return projectName;
  }

  public get extensionPath(): string {
    return this._extensionPath || '';
  }
  public get workspacePath(): string {
    return this._workspacePath || '';
  }
  public get quartusPrimePath(): string {
    return this._quartusPrimePath || '';
  }
  public get projectName(): string {
    return this._projectName || '';
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }

  private isCurrentWorkspaceValid() {
    return this._projectName !== undefined && this._projectName !== '';
  }

  public registerTasks() {
    if (this._projectName) {
      const tasks = this.taskService.getTasks();
      vscode.tasks.registerTaskProvider('quartus', {
        provideTasks(token?: vscode.CancellationToken) {
          return tasks;
        },
        resolveTask(task: vscode.Task, token?: vscode.CancellationToken) {
          return task;
        },
      });
    }
    return this;
  }

  public registerCommands() {
    let newProject = vscode.commands.registerCommand(
      'quartusprime.NewProject',
      async (node?: ActionButtonItem) => {
        this.logger.addLogMessage('Creating new project');
        if (this._projectName) {
          vscode.window.showWarningMessage(
            'Current directory have a project already.'
          );
        } else {
          const projectName = await vscode.window.showInputBox({
            title: 'Project name',
          });
          if (!projectName) {
            vscode.window.showErrorMessage('Project name do not specified!');
            return;
          }
          if (!this._workspacePath) {
            const projectFolder = await vscode.window.showOpenDialog({
              canSelectFiles: false,
              canSelectFolders: true,
              canSelectMany: false,
              title: 'Select project folder',
            });
            if (!projectFolder) {
              vscode.window.showErrorMessage('Folder not selected!');
              return;
            }
            this._workspacePath = projectFolder[0].fsPath;
            if (!this.pathExists(this._workspacePath)) {
              this.logger.addLogMessage(
                `Creating workspace folder ${this._workspacePath}`
              );
              fs.mkdirSync(this._workspacePath);
            }
          }

          this.logger.addLogMessage(
            `Creating metadata folder ${path.join(
              this._workspacePath,
              PROJECT_INFO_FOLDER
            )}`
          );
          fs.mkdirSync(path.join(this._workspacePath, PROJECT_INFO_FOLDER));

          this.logger.addLogMessage(`Running TCL script.`);
          await this.tclService.newProject(projectName);
          const mainFile = path.join(this._workspacePath, `${projectName}.vhd`);
          this.logger.addLogMessage(`Creating top entity file ${mainFile}.`);
          fs.writeFileSync(mainFile, '', { encoding: 'utf-8' });

          const success = await vscode.commands.executeCommand(
            'vscode.openFolder',
            Uri.file(this._workspacePath)
          );
        }
      }
    );

    let build = vscode.commands.registerCommand(
      'quartusprime.Build',
      async () => {
        this.logger.addLogMessage('Build...');
        if (!this.isCurrentWorkspaceValid()) {
          vscode.window.showErrorMessage(
            "Current directory have don't have any .qsf file"
          );
          return;
        }
        this.logger.addLogMessage(`Running TCL script.`);
        await this.taskService.runBuildTask();
        await this.taskService.runUpdateIO();
      }
    );

    let program = vscode.commands.registerCommand(
      'quartusprime.Program',
      () => {
        this.logger.addLogMessage('Program...');
        if (!this.isCurrentWorkspaceValid()) {
          vscode.window.showErrorMessage(
            "Current directory have don't have any .qsf file"
          );
          return;
        }
      }
    );

    let genTestBench = vscode.commands.registerCommand(
      'quartusprime.GenTestBench',
      async () => {
        this.logger.addLogMessage('Generate test-bench...');
        if (!this.isCurrentWorkspaceValid()) {
          vscode.window.showErrorMessage(
            "Current directory have don't have any .qsf file"
          );
          return;
        }
        if (!this.pathExists(path.join(this.workspacePath, 'simulation'))) {
          this.logger.addLogMessage(`Configuring test-bench project settings.`);
          await this.taskService.runConfigTestBench();
        }
        this.logger.addLogMessage(`Running TCL script.`);
        await this.taskService.runGenTestBench();
      }
    );

    let newFile = vscode.commands.registerCommand(
      'quartusprime.AddFile',
      async () => {
        this.logger.addLogMessage('Add new entity...');
        if (!this.isCurrentWorkspaceValid()) {
          vscode.window.showErrorMessage(
            "Current directory have don't have any .qsf file"
          );
          return;
        }
        const newFile = await vscode.window.showInputBox({
          title: 'Entity Name',
        });
        if (!newFile) {
          vscode.window.showErrorMessage('Entity Name do not specified!');
          return;
        }
        this.logger.addLogMessage(`Adding entity ${newFile}`);
        await this.tclService.addFile(newFile);
        await this.taskService.runUpdateFiles();
        this.workbenchSourceFiles.refresh();
      }
    );

    let simulate = vscode.commands.registerCommand(
      'quartusprime.Simulate',
      async () => {
        this.logger.addLogMessage('Simulate...');
        if (!this.isCurrentWorkspaceValid()) {
          vscode.window.showErrorMessage(
            "Current directory have don't have any .qsf file"
          );
          return;
        }
        if (!this.pathExists(path.join(this.workspacePath, 'simulation'))) {
          vscode.window.showErrorMessage(
            "Project don't have any simulation config"
          );
          return;
        }
        this.logger.addLogMessage(`Running TCL script`);
        await this.taskService.runSimulate();
      }
    );

    let refreshFiles = vscode.commands.registerCommand(
      'quartusprime.RefreshFiles',
      () => {
        this.logger.addLogMessage('Refresing files...');
        this.taskService.runUpdateFiles().then(() => {
          this.workbenchSourceFiles.refresh();
        });
      }
    );

    let refreshIO = vscode.commands.registerCommand(
      'quartusprime.RefreshIOPins',
      () => {
        this.logger.addLogMessage('Refresing IO pins...');
        this.taskService.runUpdateIO().then(() => {
          this.workbenchIOitems.refresh();
        });
      }
    );

    vscode.commands.registerCommand(
      'quartusFiles.openFile',
      (resource: SourceFileView) => {
        if (resource.label) {
          const filePath = path.normalize(
            path.join(this.workspacePath, resource.label.toString())
          );
          const uriPath = Uri.file(filePath);
          this.logger.addLogMessage(`Opening ${uriPath.fsPath}`);
          vscode.workspace.openTextDocument(uriPath).then((doc) => {
            vscode.window.showTextDocument(doc);
          });
        }
      }
    );

    this.context.subscriptions.push(newProject);
    this.context.subscriptions.push(build);
    this.context.subscriptions.push(program);
    this.context.subscriptions.push(genTestBench);
    this.context.subscriptions.push(newFile);
    this.context.subscriptions.push(simulate);
    this.context.subscriptions.push(refreshIO);
    this.context.subscriptions.push(refreshFiles);
    return this;
  }

  public registerViews() {
    vscode.window.createTreeView('quartusIOItems', {
      treeDataProvider: this.workbenchIOitems,
    });
    vscode.window.createTreeView('quartusFiles', {
      treeDataProvider: this.workbenchSourceFiles,
    });
    vscode.window.createTreeView('quartusActions', {
      treeDataProvider: this.workbenchActions,
    });
    return this;
  }

  public refresh() {
    this.workbenchSourceFiles.refresh();
    this.workbenchIOitems.refresh();
  }
}
