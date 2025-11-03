# Kie.ai API実装で学んだ教訓

## 背景

Generation Task統合（Midjourney/Imagen4/Veo3/Sora2）のポーリング機能実装時に、ドキュメントを十分に確認せずに実装を進めた結果、実際のAPIレスポンス構造と異なる実装をしてしまった。

## 発生した問題

### 間違った実装

MidjourneyのレスポンスをVeo3と同じ構造（文字列の配列）だと**推測**して実装：

```typescript
// 間違い
if (data.resultInfoJson?.resultUrls) {
  return data.resultInfoJson.resultUrls; // 文字列配列として返していた
}
```

### 実際の構造

```json
{
  "resultInfoJson": {
    "resultUrls": [
      {"resultUrl": "url1"},
      {"resultUrl": "url2"}
    ]
  }
}
```

### 結果

- コストをかけて実際のタスクを実行してもエラー
- ユーザーが実際のタスクID提供後、初めて問題が判明
- ドキュメントには正しい構造が記載されていた

## 必須プロセス（外部API実装時）

### 1. ドキュメント精読

```
✅ APIドキュメントの完全な確認
✅ レスポンス例の詳細確認
✅ 各モデル/エンドポイント間の違いを比較
```

### 2. 実際のレスポンス検証（実装前）

```bash
# 必ず実装前に実APIを叩いて確認
curl -X GET "https://api.kie.ai/api/v1/[endpoint]?taskId=[REAL_TASK_ID]" \
  -H "Authorization: Bearer ${API_KEY}"
```

**重要**: 過去のタスクIDがあれば必ず使う。なければドキュメントのサンプルで十分理解できるか確認。

### 3. 構造の文書化

実際のレスポンスを確認したら、コードコメントやドキュメントに記録：

```typescript
/**
 * Extract result URLs from API response data
 *
 * Handles three different response formats:
 * - Imagen4/Sora2: JSON string `{resultUrls: ["url1"]}`
 * - Veo3: Direct array `{response: {resultUrls: ["url1"]}}`
 * - Midjourney: Object array `{resultInfoJson: {resultUrls: [{resultUrl: "url1"}]}}`
 *                              ^^^^^^^^^^^ 重要: オブジェクトの配列！
 */
```

### 4. テストケース作成

実際のレスポンス構造に基づいてテストケースを書く：

```typescript
it('should extract resultUrls from Midjourney resultInfoJson', () => {
  // 実際のAPIレスポンスと同じ構造
  const data = {
    resultInfoJson: {
      resultUrls: [
        { resultUrl: 'https://example.com/1.jpg' },
        { resultUrl: 'https://example.com/2.jpg' },
      ],
    },
  };
  
  const urls = extractResultUrls(data);
  expect(urls).toEqual([
    'https://example.com/1.jpg',
    'https://example.com/2.jpg',
  ]);
});
```

## Kie.ai API特有の注意点

### モデルごとに異なるレスポンス構造

| モデル | エンドポイント | ステータス | 結果フィールド | 結果の型 |
|--------|---------------|-----------|--------------|---------|
| Imagen4/Sora2 | `/jobs/recordInfo` | `state` (string) | `resultJson` | JSON文字列 |
| Veo3 | `/veo/record-info` | `successFlag` (integer) | `response.resultUrls` | 文字列配列 |
| Midjourney | `/mj/record-info` | `successFlag` (integer) | `resultInfoJson.resultUrls` | オブジェクト配列 |

### エンドポイント命名規則の違い

- Imagen4/Sora2: `recordInfo` (camelCase)
- Veo3/Midjourney: `record-info` (kebab-case)

## 再発防止チェックリスト

外部API実装時は以下を必ず実施：

- [ ] APIドキュメント完全読了
- [ ] 実際のAPIレスポンス確認（curl/test script）
- [ ] レスポンス構造をコメント/ドキュメントに記録
- [ ] 実際の構造に基づくテストケース作成
- [ ] 異なるエンドポイント/モデル間の差異を比較表にまとめる
- [ ] **推測で実装しない** - 不明な点は必ず確認

## 関連ファイル

- 実装: `src/lib/generation/services/kie/polling.ts`
- テスト: `src/lib/generation/services/kie/polling.test.ts`
- ドキュメント: `docs/kie/midjourney/`, `docs/kie/veo3/`, `docs/kie/imagen/`
