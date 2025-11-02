# Custom Claude Code Agents

このディレクトリには、TDD（Test-Driven Development）による高速並列開発を実現するカスタムsubagentが定義されています。

## 🎯 Agent構成（2フェーズ戦略）

### Phase 1: 探索フェーズ
1. **serena-explore** (Sonnet) - 内部コードベース分析
2. **research** (Haiku) - 外部ソース調査

### Phase 2: TDD開発フェーズ
3. **tdd-planner** (Sonnet) - テストファースト計画立案
4. **ui-implementor** (Sonnet) - フロントエンド実装（コンポーネント + Storybook）
5. **backend-implementor** (Sonnet) - バックエンド実装（API + ビジネスロジック）

---

## 📋 TDD開発ワークフロー

```typescript
// 1. 要件を受け取る
User: "ユーザー認証機能を実装して"

// 2. 探索フェーズ（並列）
Task('serena-explore', '既存コードベースの認証パターン分析')
Task('research', '認証ライブラリのベストプラクティス調査')

// 3. TDD計画を立てる
Task('tdd-planner', `
ユーザー認証機能のTDD計画作成:
- バックエンドAPI設計とテスト戦略
- フロントエンドUI設計とテスト戦略
- 並列実装可能性の判断
- モックデータとAPIコントラクト定義
`)

// 4. 並列TDD実装（独立タスクの場合）
Task('backend-implementor', `
認証APIのTDD実装:
1. [RED] 統合テスト作成
2. [GREEN] 認証ロジック実装
3. [GREEN] APIエンドポイント実装
4. [REFACTOR] エラーハンドリング強化
`)

Task('ui-implementor', `
LoginFormコンポーネントのTDD実装:
1. [RED] コンポーネントテスト作成
2. [GREEN] UIとバリデーション実装
3. [GREEN] Storybookストーリー作成
4. [REFACTOR] アクセシビリティ向上
`)

// 5. 統合確認（メインClaude）
// E2Eテスト、全体の動作確認、リファクタリング
```

---

## 利用可能なAgent

## 🔍 探索フェーズ

### 🔍 serena-explore (Sonnet)
**目的**: Serenaのシンボリック検索とコードベース分析

**モデル**: Sonnet

**使用例**:
```typescript
Task('serena-explore', `
コンポーネントの依存関係を分析:
- UIコンポーネントの使用箇所を検索
- テストファイルとの関連を追跡
- 未使用コードを特定
`)
```

**主な機能**:
- シンボルレベルのコード理解
- 参照追跡と依存関係分析
- 効率的なセマンティック検索
- 言語に依存しない構造分析

**利用可能なツール**: すべてのSerena MCPツール

---

### 🌐 research
**目的**: 並列Web調査とドキュメント取得

**モデル**: Haiku（高速・低コスト）

**使用例**:
```typescript
// 3つのドキュメントを並列フェッチ（5秒）
Task('research', 'Next.js 14 最新ドキュメント調査（Context7使用）')
Task('research', 'Tailwind CSS v4 新機能調査（Web検索）')
Task('research', 'React 19 変更点まとめ（公式ドキュメント）')
```

**主な機能**:
- Context7による最新ライブラリドキュメント取得
- 高速Webドキュメントフェッチ
- 技術情報の比較分析
- 最新バージョン確認
- 構造化されたサマリー

**並列実行に最適**: 複数ソースを同時フェッチ（Context7 + Web）

---

## 🎯 TDD開発フェーズ

### 📋 tdd-planner (Sonnet)
**目的**: テストファースト設計と実装計画の立案

**モデル**: Sonnet

**使用例**:
```typescript
Task('tdd-planner', `
ユーザー認証機能のTDD計画作成:
- バックエンドAPI設計とテスト戦略
- フロントエンドコンポーネント設計
- 統合テストシナリオ
- 並列実装可能性の判断
`)
```

**主な機能**:
- TDDサイクル（Red→Green→Refactor）の計画
- テスト戦略の立案
- コンポーネント分割設計
- 並列実装タスクの識別
- APIコントラクト定義

**出力**:
- 実装順序付きタスクリスト
- テストケース仕様
- モックデータ定義
- 並列実行可能な独立タスク

---

### 🎨 ui-implementor (Sonnet)
**目的**: フロントエンド機能のTDD実装

**モデル**: Sonnet

**使用例**:
```typescript
Task('ui-implementor', `
LoginFormコンポーネント実装:
1. [RED] コンポーネントテスト作成
2. [GREEN] UIライブラリを使用して実装
3. [GREEN] Storybookストーリー作成
4. [REFACTOR] アクセシビリティ向上
`)
```

**主な機能**:
- UIコンポーネントのテストファースト実装
- スタイリングとレスポンシブデザイン
- アクセシビリティ対応
- Storybookストーリー作成
- インタラクションテスト

**TDDサイクル**:
1. **Red**: コンポーネントテスト作成（失敗する）
2. **Green**: 最小限の実装でテストを通す
3. **Refactor**: コードとスタイルの改善

---

### ⚙️ backend-implementor (Sonnet)
**目的**: バックエンド機能のTDD実装

**モデル**: Sonnet

**使用例**:
```typescript
Task('backend-implementor', `
認証APIの実装:
1. [RED] API統合テスト作成
2. [GREEN] 認証ロジック実装
3. [GREEN] APIエンドポイント実装
4. [REFACTOR] エラーハンドリング強化
`)
```

**主な機能**:
- API/サービス層のテストファースト実装
- データベーススキーマ設計
- ビジネスロジック実装
- エラーハンドリングとバリデーション
- 統合テスト作成

**TDDサイクル**:
1. **Red**: 統合テスト作成（失敗する）
2. **Green**: 最小限の実装でテストを通す
3. **Refactor**: パフォーマンスとセキュリティ改善

---

## 🚀 並列実行のメリット

### 従来（順次実行）
```typescript
WebFetch("url1")  // 5秒
WebFetch("url2")  // 5秒
WebFetch("url3")  // 5秒
// 合計: 15秒
```

### Subagent活用（並列実行）
```typescript
Task('research', "url1 調査")
Task('research', "url2 調査")
Task('research', "url3 調査")
// 合計: ~5秒（最長リクエスト時間）
```

**速度向上: 3倍** 🚀

---

## 実践例

### 例1: 完全なTDD開発サイクル
```typescript
// Phase 1: 探索（並列）
Task('serena-explore', '既存の認証実装パターンを分析')
Task('research', '認証ライブラリのベストプラクティス調査')

// Phase 2: TDD計画
Task('tdd-planner', `
ユーザー認証機能のTDD実装計画:
- 探索結果を基にした設計
- テスト戦略と実装順序
- 並列実装可能タスクの識別
`)

// Phase 3: 並列TDD実装
Task('backend-implementor', `
認証APIのTDD実装:
1. [RED] POST /api/auth/login統合テスト
2. [GREEN] 認証ロジック実装
3. [REFACTOR] セキュリティ強化
`)

Task('ui-implementor', `
LoginFormのTDD実装:
1. [RED] フォームコンポーネントテスト
2. [GREEN] UIとバリデーション実装
3. [REFACTOR] UX改善
`)

// Phase 4: 統合（メインClaude）
// E2Eテストと全体リファクタリング
```

### 例2: 技術スタック調査（並列）
```typescript
// 3つの技術を並列調査（5秒で完了）
Task('research', `
状態管理ライブラリ調査:
- Context7で公式ドキュメント取得
- TypeScript対応状況
- パフォーマンス比較
`)

Task('research', `
データフェッチライブラリ調査:
- Context7で最新ドキュメント取得
- キャッシュ戦略
- 使用例とパターン
`)

Task('research', `
ORMライブラリ調査:
- Context7で公式ドキュメント取得
- マイグレーション管理
- パフォーマンス特性
`)
```

### 例3: コード分析 + Web調査（混合）
```typescript
// 探索フェーズを並列実行
Task('serena-explore', '認証関連コンポーネントの依存関係分析')
Task('research', 'JWTトークン管理のベストプラクティス調査')
Task('research', 'セキュアなパスワード管理手法調査')
```

---

## カスタムAgentの作成

新しいagentを作成するには、`.claude/agents/`に新しいマークダウンファイルを作成します：

### ファイル構造
```markdown
---
name: agent-name
description: Brief description of the agent's purpose
tools: tool1,tool2,tool3
model: sonnet|haiku|opus
---

System prompt content here...

## Your Role
...

## Instructions
...
```

### 必須フィールド
- **name**: 小文字とハイフンのみ（例: `api-explorer`）
- **description**: Agentの目的を明確に記述
- **tools**: カンマ区切りのツールリスト（省略するとすべてのツール）
- **model**: `sonnet`（デフォルト）, `haiku`（高速）, `opus`（複雑なタスク）

### モデル選択ガイド

| モデル | 用途 | 速度 | コスト |
|--------|------|------|--------|
| **haiku** | Web調査、ドキュメント取得 | ⚡⚡⚡ | 💰 |
| **sonnet** | コード分析、設計 | ⚡⚡ | 💰💰 |
| **opus** | 複雑な実装、アーキテクチャ | ⚡ | 💰💰💰 |

---

## ベストプラクティス

### 1. 2フェーズ戦略を守る
```typescript
// ✅ 良い: 探索→計画→実装の順序
// Phase 1: 探索
Task('serena-explore', '既存実装パターン分析')
Task('research', 'ベストプラクティス調査')

// Phase 2: TDD計画
Task('tdd-planner', 'テスト戦略と実装計画')

// Phase 3: TDD実装
Task('backend-implementor', 'APIのTDD実装')
Task('ui-implementor', 'UIのTDD実装')

// ❌ 悪い: 探索せずにいきなり実装
Task('backend-implementor', '実装して')
```

### 2. 並列実行を活用
```typescript
// ✅ 良い: 独立したタスクを並列実行
Task('research', 'ライブラリA調査')
Task('research', 'ライブラリB調査')
Task('research', 'ライブラリC調査')

// ✅ 良い: 探索フェーズの並列実行
Task('serena-explore', 'コードベース分析')
Task('research', 'ベストプラクティス調査')

// ✅ 良い: TDD実装の並列実行
Task('backend-implementor', 'APIのTDD実装')
Task('ui-implementor', 'UIのTDD実装')

// ❌ 悪い: 順次実行
await Task('research', 'タスク1')
await Task('research', 'タスク2')
```

### 3. 適切なAgentを選択
```typescript
// 内部コードベース分析 → serena-explore
Task('serena-explore', 'コンポーネント依存関係分析')
Task('serena-explore', '未使用関数の検出')

// 外部ソース調査 → research
Task('research', 'ライブラリのベストプラクティス調査')
Task('research', 'API仕様調査')

// TDD計画 → tdd-planner
Task('tdd-planner', 'テスト戦略と実装順序の立案')

// フロントエンド実装 → ui-implementor
Task('ui-implementor', 'コンポーネントのTDD実装')

// バックエンド実装 → backend-implementor
Task('backend-implementor', 'APIのTDD実装')
```

### 4. 明確な指示とTDDサイクルの明記
```typescript
// ✅ 良い: TDDサイクルを明記
Task('ui-implementor', `
ログインフォームのTDD実装:
1. [RED] フォームバリデーションテスト作成
2. [GREEN] 最小限の実装でテストをパス
3. [REFACTOR] コードとUXの改善
`)

// ✅ 良い: 具体的な調査項目
Task('research', `
認証ライブラリ調査:
- セキュリティ機能
- TypeScript対応
- 使用例とパターン
`)

// ❌ 悪い: 曖昧な指示
Task('ui-implementor', 'フォーム作って')
Task('research', '認証について調べて')
```

### 5. ツールの制限
- 必要最小限のツールのみを許可
- セキュリティと効率性の向上
- 例: Web調査にはWrite不要
- 例: TDD実装にはWebFetch不要

---

## 再起動

`.claude/agents/`の変更後は**Claude Codeの再起動**が必要です。

確認コマンド:
```
/agents
```

---

## トラブルシューティング

### Agentが認識されない
1. Claude Codeを再起動
2. YAML frontmatterの形式を確認
3. ファイル名が`.md`で終わっているか確認

### 並列実行されない
1. 1つのメッセージで複数Taskを呼び出しているか確認
2. 各Taskが独立しているか確認

### タイムアウト
1. Haikuモデルを使用（高速）
2. タスクを小さく分割
3. 不要な詳細は省略
