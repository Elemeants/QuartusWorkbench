import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Extension } from './extension';

export class TclCommandExecuter {
  private scriptsPath: string;
  private process: cp.ChildProcessWithoutNullStreams | undefined;

  private get quartusRootPath() {
    return path.join(this.extension.quartusPrimePath, 'quartus\\bin64\\');
  }

  private async execCommand(cmd: string, args: string[], cwd: string) {
    return new Promise ((resolve, reject) => {
      this.process = cp.spawn(cmd, args, { cwd: cwd });

      this.extension.logger.clearCompilerMessage();
      this.extension.logger.showCompilerLog();
      this.extension.logger.logCommand("Running", cmd, args);

      this.process.stdout.on('data', (newStdout: Buffer | string) => {
        this.extension.logger.addCompilerMessage(newStdout.toString());
      });

      this.process.stderr.on('data', (newStderr: Buffer | string) => {
        this.extension.logger.addCompilerMessage(newStderr.toString());
      });

      this.process.on('error', (err) => {
        this.extension.logger.addLogMessage(`Build fatal error: ${err.message}`);
        this.extension.logger.displayStatus('x', 'errorForeground', undefined, 'error');
        void this.extension.logger.showErrorMessageWithExtensionLogButton(
          `Build terminated with fatal error: ${err.message}.`
        );
        reject(`Build fatal error: ${err.message}`);
      });

      this.process.on('exit', () => {
        this.process = undefined;
        resolve(true);
      });
    });
  }

  constructor(
    private extension: Extension
  ) {
    this.scriptsPath = path.join(this.extension.extensionPath, 'tcl');
    this.process = undefined;
  }

  public async build() {
    const execPath = path.join(this.quartusRootPath, 'quartus_sh.exe');
    const compilePath = path.join(this.scriptsPath, 'compile.tcl');
    console.log('Running build');
    await this.execCommand(
      `${execPath}`,
      ['-t', compilePath, this.extension.projectName],
      this.extension.workspacePath
    );
    console.log('build done');
  }

  public async newProject(projectName: string) {
    const execPath = path.join(this.quartusRootPath, 'quartus_sh.exe');
    const scriptPath = path.join(this.scriptsPath, 'new_project.tcl');
    console.log('Running new project');
    await this.execCommand(
      `${execPath}`,
      ['-t', scriptPath, projectName],
      this.extension.workspacePath
    );
    console.log('new project done');
  }

  public async genTestBench() {
    const execPath = path.join(this.quartusRootPath, 'quartus_sh.exe');
    const scriptPath = path.join(this.scriptsPath, 'gen_test_bench.tcl');
    console.log('Running genTestBench');
    await this.execCommand(
      `${execPath}`,
      ['-t', scriptPath, this.extension.projectName],
      this.extension.workspacePath
    );
    console.log('genTestBench done');
  }

  public async configureProjectForTest() {
    const execPath = path.join(this.quartusRootPath, 'quartus_sh.exe');
    const scriptPath = path.join(this.scriptsPath, 'configure_test_bench.tcl');
    console.log('Running configureProjectForTest');
    await this.execCommand(
      `${execPath}`,
      ['-t', scriptPath, this.extension.projectName],
      this.extension.workspacePath
    );
    console.log('configureProjectForTest done');
  }

  public async addFile(fileName: string) {
    const execPath = path.join(this.quartusRootPath, 'quartus_sh.exe');
    const scriptPath = path.join(this.scriptsPath, 'add_file.tcl');
    console.log('Running addFile');
    await this.execCommand(
      `${execPath}`,
      ['-t', scriptPath, this.extension.projectName, fileName],
      this.extension.workspacePath
    );
    console.log('addFile done');
  }

  public async updateProjectFiles() {
    const execPath = path.join(this.quartusRootPath, 'quartus_sh.exe');
    const scriptPath = path.join(this.scriptsPath, 'project_files.tcl');
    console.log('Running updateProjectFiles');
    await this.execCommand(
      `${execPath}`,
      ['-t', scriptPath, this.extension.projectName],
      this.extension.workspacePath
    );
    console.log('updateProjectFiles done');
  }

  public async updateIOPins() {
    const execPath = path.join(this.quartusRootPath, 'quartus_sh.exe');
    const scriptPath = path.join(this.scriptsPath, 'io_pins.tcl');
    console.log('Running updateIOPins');
    await this.execCommand(
      `${execPath}`,
      ['-t', scriptPath, this.extension.projectName],
      this.extension.workspacePath
    );
    console.log('updateIOPins done');
  }

  public async runSimulation() {
    const execPath = path.join(this.quartusRootPath, 'quartus_sh.exe');
    const scriptPath = path.join(this.scriptsPath, 'simulate.tcl');
    console.log('Running runSimulation');
    await this.execCommand(
      `${execPath}`,
      ['-t', scriptPath, this.extension.quartusPrimePath, this.extension.projectName],
      this.extension.workspacePath
    );
    console.log('runSimulation done');
  }
}
