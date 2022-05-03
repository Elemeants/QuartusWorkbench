import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { PROJECT_INFO_FOLDER } from './extension';

export class WorkbenchQuartusSourceFilesView
  implements vscode.TreeDataProvider<SourceFileView>
{
  private _onDidChangeTreeData: vscode.EventEmitter<SourceFileView | undefined | null | void> = new vscode.EventEmitter<SourceFileView | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<SourceFileView | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private workspace?: string) {}

  public getTreeItem(
    element: SourceFileView
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  public getChildren(
    element?: SourceFileView
  ): vscode.ProviderResult<SourceFileView[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      if (!this.workspace || !this.pathExists(this.workspace)) {
        return Promise.resolve([]);
      } else {
        return Promise.resolve(this.readFiles());
      }
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  private readFiles(): SourceFileView[] {
    if (!this.workspace) { return []; }
    const filesPath = path.join(this.workspace, PROJECT_INFO_FOLDER, 'files.txt');
    if (this.pathExists(filesPath)) {
      try {
        const items = fs
          .readFileSync(filesPath, 'utf8')
          .split('\n')
          .filter(item => item.length > 0)
          .map<SourceFileView>((entry) => new SourceFileView(entry));
        return items;
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}

export class SourceFileView extends vscode.TreeItem {
  constructor(label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'file';
    this.command = {
      "title": this.contextValue,
      "command": `vscode.open`
    };
  }
}
