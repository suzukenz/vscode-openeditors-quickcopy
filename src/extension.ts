import * as vscode from "vscode";
import path from "node:path";

/**
 * 開いているタブの情報を格納する型
 */
interface TabInfo {
  relativePath: string;
  inputs: vscode.TabInputText[];
  languageId: string;
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Copy Open Editors is now active");

  const disposable = vscode.commands.registerCommand(
    "copyOpenEditors.copy",
    copyOpenEditorsCommand
  );

  context.subscriptions.push(disposable);
}

/**
 * 開いているエディターのパスをコピーするメインコマンド
 */
async function copyOpenEditorsCommand(): Promise<void> {
  try {
    const tabs = getAllOpenTabs();
    
    if (tabs.length === 0) {
      vscode.window.showWarningMessage("No open tabs to copy.");
      return;
    }

    const tabInfos = groupTabsByRelativePath(tabs);
    const quickPickItems = createQuickPickItems(tabInfos);
    
    await showTabSelectionDialog(quickPickItems);
  } catch (error) {
    handleError(error);
  }
}

/**
 * 全ての開いているタブを取得
 */
function getAllOpenTabs(): vscode.Tab[] {
  return vscode.window.tabGroups.all.flatMap((group) => group.tabs);
}

/**
 * タブを相対パス別にグループ化
 */
function groupTabsByRelativePath(tabs: vscode.Tab[]): TabInfo[] {
  const pathMap = new Map<string, vscode.TabInputText[]>();

  tabs
    .filter((tab): tab is vscode.Tab & { input: vscode.TabInputText } => 
      tab.input instanceof vscode.TabInputText
    )
    .forEach((tab) => {
      const filePath = tab.input.uri.fsPath;
      const relativePath = getRelativePath(filePath);
      
      if (!pathMap.has(relativePath)) {
        pathMap.set(relativePath, []);
      }
      pathMap.get(relativePath)?.push(tab.input);
    });

  return Array.from(pathMap.entries()).map(([relativePath, inputs]) => {
    const languageId = getLanguageId(inputs[0]);
    return { relativePath, inputs, languageId };
  });
}

/**
 * タブ入力から言語IDを取得
 */
function getLanguageId(input: vscode.TabInputText): string {
  const document = vscode.workspace.textDocuments.find(
    (doc) => doc.uri.toString() === input.uri.toString()
  );
  return document?.languageId || "unknown";
}

/**
 * QuickPickアイテムを作成
 */
function createQuickPickItems(tabInfos: TabInfo[]): vscode.QuickPickItem[] {
  return tabInfos.map(({ relativePath, inputs, languageId }) => {
    const description = inputs.length > 1 
      ? `${languageId} (${inputs.length} files)`
      : languageId;
    
    return {
      label: relativePath,
      description,
      picked: true,
    };
  });
}

/**
 * タブ選択ダイアログを表示
 */
async function showTabSelectionDialog(items: vscode.QuickPickItem[]): Promise<void> {
  const quickPick = vscode.window.createQuickPick();
  quickPick.title = "Select Open Tabs to Copy (default: all selected)";
  quickPick.items = items;
  quickPick.canSelectMany = true;
  quickPick.selectedItems = items;

  quickPick.onDidAccept(() => {
    const selectedPaths = quickPick.selectedItems.map((item) => item.label);
    copyPathsToClipboard(selectedPaths);
    quickPick.hide();
  });

  quickPick.show();
}

/**
 * 選択されたパスをクリップボードにコピー
 */
async function copyPathsToClipboard(paths: string[]): Promise<void> {
  if (paths.length === 0) {
    return;
  }

  try {
    await vscode.env.clipboard.writeText(paths.join("\n"));
    vscode.window.showInformationMessage(
      `Copied ${paths.length} open tab paths to clipboard.`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to copy to clipboard: ${error}`);
  }
}

/**
 * エラーハンドリング
 */
function handleError(error: unknown): void {
  console.error("Copy Open Editors error:", error);
  vscode.window.showErrorMessage(`Error copying tab paths: ${error}`);
}

export function deactivate() {}

/**
 * ファイルの絶対パスをワークスペースからの相対パスに変換する
 * @param filePath 変換対象のファイルパス
 * @returns ワークスペースからの相対パス（ワークスペースが存在しない場合は元のパスをそのまま返す）
 */
function getRelativePath(filePath: string): string {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  return workspaceFolder
    ? path.relative(workspaceFolder.uri.fsPath, filePath)
    : filePath;
}
