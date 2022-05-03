import path = require('path');
import * as vscode from 'vscode';
import { Extension } from './extension';

export class TaskService {
  private tasks: vscode.Task[];
  private _buildTask: vscode.Task | undefined;
  private _genTestBench: vscode.Task | undefined;
  private _configTestBench: vscode.Task | undefined;
  private _updateFiles: vscode.Task | undefined;
  private _updateIO: vscode.Task | undefined;
  private _simulate: vscode.Task | undefined;

  constructor(private extension: Extension) {
    const quartusPrimeExecPath = path.join(
      this.extension.quartusPrimePath,
      'quartus\\bin64\\'
    );
    const scriptsPath = path.join(this.extension.extensionPath, 'tcl');
    const quartusSh = path.join(quartusPrimeExecPath, 'quartus_sh.exe');

    this.extension.logger.addLogMessage('Building tasks...');

    this._buildTask = this.create('Build', quartusSh, [
      '-t',
      path.join(scriptsPath, 'compile.tcl'),
      this.extension.projectName,
    ]);
    this._genTestBench = this.create('Generate test bench', quartusSh, [
      '-t',
      path.join(scriptsPath, 'gen_test_bench.tcl'),
      this.extension.projectName,
    ]);
    this._configTestBench = this.create('Configure test bench', quartusSh, [
      '-t',
      path.join(scriptsPath, 'configure_test_bench.tcl'),
      this.extension.projectName,
    ]);
    this._updateFiles = this.create('Update Project files', quartusSh, [
      '-t',
      path.join(scriptsPath, 'project_files.tcl'),
      this.extension.projectName,
    ]);
    this._updateIO = this.create('Update IO Pins', quartusSh, [
      '-t',
      path.join(scriptsPath, 'io_pins.tcl'),
      this.extension.projectName,
    ]);
    this._simulate = this.create('Run simulation', quartusSh, [
      '-t',
      path.join(scriptsPath, 'simulate.tcl'),
      this.extension.quartusPrimePath,
      this.extension.projectName,
    ]);

    const defTasks: (vscode.Task | undefined)[] = [
      this._buildTask,
      this._genTestBench,
      this._configTestBench,
      this._updateFiles,
      this._updateIO,
      this._simulate,
    ];

    this.tasks = <vscode.Task[]>defTasks.filter((item) => item !== undefined);
  }

  private create(name: string, cmd: string, args: string[]) {
    const ws =
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0]
        : undefined;
    if (ws === undefined) {
      return undefined;
    }

    return new vscode.Task(
      { type: 'quartus' }, // this is the same type as in tasks.json
      ws, // The workspace folder
      name, // how you name the task
      'Quartus', // Shows up as MyTask: name
      new vscode.ShellExecution(cmd, args),
      [] // list of problem matchers (can use $gcc or other pre-built matchers, or the ones defined in package.json)
    );
  }

  public getTasks() {
    return this.tasks;
  }

  private async runTask (task: vscode.Task) {
    const execution = await vscode.tasks.executeTask(task);
        
    return new Promise<void>(resolve => {
        let disposable = vscode.tasks.onDidEndTask(e => {
            if (e.execution === execution) {
                disposable.dispose();
                resolve();
            }
        });
    });
  }

  public async runBuildTask() {
    if (this._buildTask) {
        return this.runTask(this._buildTask);
    }
  }

  public async runGenTestBench() {
    if (this._genTestBench) {
        return this.runTask(this._genTestBench);
    }
  }
  public async runConfigTestBench() {
    if (this._configTestBench) {
        return this.runTask(this._configTestBench);
    }
  }
  public async runUpdateFiles() {
    if (this._updateFiles) {
        return this.runTask(this._updateFiles);
    }
  }
  public async runUpdateIO() {
    if (this._updateIO) {
        return this.runTask(this._updateIO);
    }
  }
  public async runSimulate() {
    if (this._simulate) {
        return this.runTask(this._simulate);
    }
  }
}
