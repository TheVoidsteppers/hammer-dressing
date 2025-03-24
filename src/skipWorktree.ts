import * as vscode from 'vscode';
import { TreeItem, ProviderResult } from 'vscode';
import { GitExtension } from './api/git'

export class SkipWorktreeProvider implements vscode.TreeDataProvider<TreeItem> {

  private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>()
  readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event

  private data: TreeItem[] = []

  constructor() {
    this.parseTree().then(() => {
      this._onDidChangeTreeData.fire()
    })
  }

  get gitExtension () {
    const ext = vscode.extensions.getExtension<GitExtension>('vscode.git');
    const gitExtension = ext?.exports;
    return gitExtension
  }

  get git() {
    const git = (this.gitExtension as any).model?.git
    return git
  }

  get repositoryRoot () : string | undefined {
    return this.gitExtension?.getAPI(1)?.repositories[0]?.rootUri?.fsPath
  }

  async refresh(): Promise<void> {
    await this.parseTree();
    this._onDidChangeTreeData.fire();
  }

  private async parseTree(): Promise<void> {
    if (!this.repositoryRoot) return
    this.data = [];
    const lsFiles = await this.git.exec(this.repositoryRoot, 'ls-files -v'.split(' '))
    const stdoutStr = lsFiles.stdout
    const skipFiles = stdoutStr.split('\n').filter((file: string) => file.startsWith('S ') ||  file.startsWith('s ')).map((file: string) => file.replace(/s /i, ''))

    this.data = skipFiles.map((item: string)  => {
      return new TreeItem(item)
    })
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element
  }

  getChildren(): ProviderResult<TreeItem[]> {
    return this.data;
  }
}
