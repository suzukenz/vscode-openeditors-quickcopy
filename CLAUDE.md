# 対象ファイル

- **IMPORTANT**: 以下のファイルは成果物ファイル等なので、Readしないこと。
  - `out/`

# Bash commands

- `pnpm run compile`: TypeScriptのコンパイルを実行する
- `pnpm run lint`: コードスタイルのチェックを実行する
- `pnpm run pretest`: テストの前処理を実行する(compile, lint)
- `pnpm run test`: テストを実行する

# Workflow

- コード変更後は必ず `pnpm run lint` でコードスタイルをチェックする

# Testing

- VS Code拡張機能のテストは標準出力エラーが多めに出るので、テスト結果を最後まで確認してから、成功か失敗かを判断すること。

# プロジェクト構成

```
src/
  extension.ts        # エントリポイント（VS Code拡張機能のメイン処理）
  test/
    runTest.ts        # テスト実行設定
    fixtures/         # テスト用のフィクスチャファイル
      foo.ts
      bar.js
    suite/
      extension.test.ts # ユニットテスト
out/                  # TypeScriptコンパイル結果（成果物。commitしない。）
docs/
  project-brief.md    # プロジェクトの概要
images/
  icon.png            # 拡張機能のアイコン
  icon_128x128.png
package.json          # パッケージ設定
tsconfig.json         # TypeScript設定
eslint.config.mjs     # ESLint設定
```
