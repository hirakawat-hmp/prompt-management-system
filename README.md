# Prompt Management System

Next.js + Mastra AIフレームワークを使用したプロンプト管理システム。

## 🚀 クイックスタート

### 開発サーバーの起動
```bash
npm run dev
```
http://localhost:3000 でアクセス

### Storybookの起動
```bash
npm run storybook
```
http://localhost:6006 でアクセス

## 📚 ドキュメント

- **[開発ドキュメント](./docs/development/)** - UI開発、Storybook、shadcn/uiガイド
- **[Kieドキュメント](./docs/kie/)** - Kieサービスドキュメント

### UI開発
- [Storybookガイド](./docs/development/storybook.md) - コンポーネント開発環境
- [shadcn/ui + Storybook](./docs/development/shadcn-storybook.md) - UIコンポーネント統合

## 🛠️ 技術スタック

### コア
- **Next.js 16** - React フレームワーク (App Router)
- **React 19** - UIライブラリ
- **TypeScript 5** - 型安全な開発

### AI/エージェント
- **Mastra Core** - AIエージェントフレームワーク
- **Google Gemini 2.5 Pro** - LLMモデル
- **LibSQL** - データベース/ストレージ

### UI開発
- **Storybook 10** - コンポーネント開発環境
- **shadcn/ui** - UIコンポーネントライブラリ
- **Tailwind CSS 4** - ユーティリティファーストCSS
- **Radix UI** - アクセシブルなプリミティブ

### テスト
- **Vitest 4** - ユニットテスト
- **Playwright** - E2Eテスト
- **@storybook/addon-vitest** - コンポーネントテスト

## 📦 主要コマンド

### 開発
```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動
npm run lint         # ESLintでコードチェック
```

### Storybook
```bash
npm run storybook         # Storybook開発サーバー
npm run build-storybook   # Storybookビルド
```

### UI コンポーネント
```bash
npx shadcn@latest add <component>  # shadcn/uiコンポーネント追加
npx shadcn@latest add button       # 例: Buttonコンポーネント追加
```

## 🏗️ プロジェクト構造

```
prompt-management-system/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/
│   │   └── ui/          # shadcn/ui コンポーネント
│   ├── mastra/          # Mastra AI設定
│   │   ├── agents/      # AIエージェント
│   │   ├── workflows/   # ワークフロー
│   │   └── tools/       # ツール定義
│   └── lib/             # ユーティリティ関数
├── docs/                # ドキュメント
│   ├── development/     # 開発ガイド
│   └── kie/            # Kieサービスドキュメント
├── .storybook/         # Storybook設定
├── public/             # 静的ファイル
└── components.json     # shadcn/ui設定
```

## 🎨 UI開発ワークフロー

1. **コンポーネント追加**
   ```bash
   npx shadcn@latest add dialog
   ```

2. **Storybook ストーリー作成**
   - `src/components/ui/dialog.stories.tsx` を作成

3. **Storybookで確認**
   ```bash
   npm run storybook
   ```

4. **アプリケーションで使用**
   ```typescript
   import { Dialog } from '@/components/ui/dialog';
   ```

## 🌍 環境変数

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

必要な環境変数：
```
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
```

## 🔗 リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [Mastra Documentation](https://mastra.ai/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Storybook Documentation](https://storybook.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## 📝 ライセンス

Private
