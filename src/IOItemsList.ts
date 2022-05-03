import { PROJECT_INFO_FOLDER } from './extension';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class WorkbenchQuartusIOItemsView
  implements vscode.TreeDataProvider<IOEntityItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<IOEntityItem | undefined | null | void> = new vscode.EventEmitter<IOEntityItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<IOEntityItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private workspace?: string) {}

  public getTreeItem(
    element: IOEntityItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  public getChildren(
    element?: IOEntityItem
  ): vscode.ProviderResult<IOEntityItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      if (!this.workspace || !this.pathExists(this.workspace)) {
        return Promise.resolve([]);
      } else {
        return Promise.resolve(this.readPins());
      }
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  private readPins(): IOEntityItem[] {
    if (!this.workspace) { return []; }
    const filesPath = path.join(this.workspace, PROJECT_INFO_FOLDER, 'pins.txt');
    if (this.pathExists(filesPath)) {
      try {
        const items = fs
          .readFileSync(filesPath, 'utf8')
          .split('\n')
          .filter(item => item.length > 0)
          .map<IOEntityItem>((entry) => new IOEntityItem(entry));
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

export class IOEntityItem extends vscode.TreeItem {
  constructor(label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
  }
}
