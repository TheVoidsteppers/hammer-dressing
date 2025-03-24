import * as vscode from 'vscode';
import { TreeItem } from 'vscode';
import { SkipWorktreeProvider } from './skipWorktree';
import { GitExtension } from './api/git'


export async function activate(context: vscode.ExtensionContext): Promise<void> {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.HammerDressing.git.skip-worktree', (...args) => {
      const filePaths = args[1]
      handleToggleSkipWorktree(filePaths, true).then(() => {
        skipWorktreeProvider.refresh()
      })
    }),
    vscode.commands.registerCommand('extension.HammerDressing.git.no-skip-worktree', (...args) => {
      const filePaths = args[1]
      handleToggleSkipWorktree(filePaths, false).then(() => {
        skipWorktreeProvider.refresh()
      })
    }),
  );

  const skipWorktreeProvider = new SkipWorktreeProvider();
	vscode.window.registerTreeDataProvider('SkipWorktreeFiles', skipWorktreeProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.HammerDressing.git.skip-worktree-refresh', () => skipWorktreeProvider.refresh()),
    vscode.commands.registerCommand('extension.HammerDressing.git.no-skip-worktree-in-treeview', (treeItem: TreeItem) => {
      handleNoSkipWorktree(treeItem).then(() => {
        skipWorktreeProvider.refresh()
      })
    }),
  )
}


async function handleToggleSkipWorktree (filePaths: vscode.Uri[], isSkip: boolean): Promise<void> {
  const ext = vscode.extensions.getExtension<GitExtension>('vscode.git');
  await ext?.activate();
  const gitExtension = ext?.exports;
  const git = (gitExtension as any).model?.git
  const gitApi = gitExtension?.getAPI(1);

  const repositoryRoot = gitApi?.repositories[0]?.rootUri?.fsPath

  if (Array.isArray(filePaths)) {
    const execArr = filePaths.map((filePath) => {
      const folder = vscode.workspace.getWorkspaceFolder(filePath)
      if (!folder || !folder.uri) {
        return
      }
      const path = filePath.path.replace(folder!.uri.path, '.')
      const command = `update-index ${ isSkip ? '--skip-worktree' : '--no-skip-worktree' } ${path}`

      return git.exec(repositoryRoot, command.split(' '))
    })
    await Promise.all(execArr)
  }
}

async function handleNoSkipWorktree (treeItem: TreeItem): Promise<void> {
  const ext = vscode.extensions.getExtension<GitExtension>('vscode.git');
  await ext?.activate();
  const gitExtension = ext?.exports;
  const git = (gitExtension as any).model.git
  const gitApi = gitExtension?.getAPI(1);

  const repositoryRoot = gitApi?.repositories[0]?.rootUri?.fsPath
  const command = `update-index --no-skip-worktree ${treeItem.label}`

  await git.exec(repositoryRoot, command.split(' '))
}
