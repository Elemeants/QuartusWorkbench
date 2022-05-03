import * as vscode from 'vscode';

export class WorkbenchQuartusActionItemView implements vscode.TreeDataProvider<ActionButtonItem> {
  public getTreeItem(
    element: ActionButtonItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  public getChildren(element?: ActionButtonItem): vscode.ProviderResult<ActionButtonItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve([
        new ActionButtonItem('New Project', 'NewProject'),
        new ActionButtonItem('Build', 'Build'),
        new ActionButtonItem('Simulate', 'Simulate'),
        new ActionButtonItem('Add file', 'AddFile'),
        new ActionButtonItem('Create test-bench', 'GenTestBench'),
        new ActionButtonItem('Upload to FPGA', 'Program')
      ]);
    }
  }
}

export class ActionButtonItem extends vscode.TreeItem {
  constructor(label: string, context: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = context;
    this.command = {
      "title": this.contextValue,
      "command": `quartusprime.${this.contextValue}`
    };
  }
}
