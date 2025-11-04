# 画像生成プロンプトTips - Midjourney

> このドキュメントはMidjourneyにおける効果的なプロンプト作成テクニックをまとめたものです。
> LLMがプロンプト生成・改善時に参照することを想定しています。

## 1. プロンプト構造の基本

### 1.1 必須要素
- **主題（Subject）**: 人物、動物、キャラクター、場所、オブジェクトなど、何を生成したいかを明確に記述。プロンプトの最も重要な部分であり、生成される画像のコアコンテンツを決定する。
- **スタイル（Style）**: 写真、絵画、イラスト、彫刻、落書き、タペストリーなど、どのような形式で表現するかを指定。全体的な美的方向性を設定する。
- **品質修飾語（Quality modifiers）**: "high quality", "8K", "detailed", "HDR"など、出力の品質レベルを指定する語句。

### 1.2 推奨要素
- **構図（Composition）**: ポートレート、ヘッドショット、クローズアップ、鳥瞰図、黄金比、三分割法、シンメトリーなど、どのようにフレーミングするかを指定。
- **照明（Lighting）**: ソフトライト、アンビエント、曇り空、ネオン、スタジオライト、ゴールデンアワーなど、照明の種類と雰囲気。
- **色彩（Colors）**: 鮮やか、落ち着いた、明るい、モノクローム、カラフル、白黒、パステルなど、色調の方向性。
- **その他**: 環境（屋内、屋外、月面、水中、都市など）、ムード（遊び心、穏やか、陰鬱、エネルギッシュなど）、カメラ設定（Canon EOS R5、Sony α7 IIIなど）

### 1.3 要素の推奨順序
```
[画像プロンプト（ある場合）] + [主題の詳細] + [環境/背景] + [スタイル] + [構図] + [照明] + [色彩] + [ムード] + [品質修飾語] + [パラメータ]
```

**注意**:
- 重要な要素ほど前方に配置することが推奨されるが、プロンプト内の順序だけでは完全な制御は難しい
- より確実に要素の重要度を制御するには、`::`による重み付けを使用する（後述）

## 2. 効果的な記述テクニック

### 2.1 具体性
- **抽象的な概念を避け、具体的で視覚的な描写を使用する**
- 「美しい」「良い」などの曖昧な形容詞ではなく、「フレックルのある」「ゴールデンアワーの光」など具体的な描写を使う
- 代名詞や暗黙の主語を避け、明確に対象を指定する

例:
- ❌ 悪い例: "a beautiful woman looking at it"
- ✅ 良い例: "a woman with freckles and green eyes looking at a sunset over the ocean"
- ❌ 悪い例: "very tired person"
- ✅ 良い例: "exhausted person with dark circles under eyes"

### 2.2 重み付け・強調
- **ダブルコロン`::`を使用して要素の重要度を数値で指定**
- デフォルトの重みは1.0で、数値が大きいほど影響力が増す
- 比率が重要（`2::1` は `4::2` や `100::50` と同じ）
- モデルバージョン4, 5, 6では小数点も使用可能（より精密な制御）

構文:
```
[要素1]::[重み数値] [要素2]::[重み数値] [要素3]
```

例:
- `space::2 ship` - "space"が"ship"の2倍重要
- `surreal landscape::2 floating islands::1 balloons::2` - 風船と風景が浮島の2倍重要
- `still life painting:: fruit::-0.5` - 果物を抑制（ネガティブな重み）

**注意**: ダブルコロンの左側にはスペースを入れず、右側には1つのスペースを入れる

### 2.3 否定表現の扱い
- **`--no`パラメータを使用して望まない要素を除外**
- 「don't」「without」などの自然言語での否定は機能しない（逆にその要素が強調される可能性がある）
- `--no [除外したい要素]`の形式で使用（複数の要素は1つの`--no`の後にスペース区切りで列挙）
- `--no`パラメータは重み-0.5と同等

構文:
```
[プロンプト本文] --no [除外要素1] [除外要素2]
```

例:
- ✅ 良い例: `vibrant tulip fields --no red yellow`
- ❌ 悪い例: `vibrant tulip fields without red or yellow colors`
- ✅ 良い例: `portrait of a woman --no oversaturated colors distorted face`
- ❌ 悪い例: `portrait of a woman, don't include bad stuff`

注意点:
- 具体的に除外したい要素を明示する（「悪いもの」などの曖昧な表現は避ける）
- 必要な場合のみ使用し、過度に使用しない
- ポジティブな指示（「〜にする」）を優先し、ネガティブプロンプトは補助的に使用

### 2.4 長さの最適化
- 推奨文字数/単語数: **5〜75単語、理想は40単語以下**
- 理由:
  - 短すぎると誤解釈の余地が生まれる
  - 長すぎるとAIが混乱する
  - 40単語以降は無視される可能性が高まる
  - 60単語以降は無視される可能性が非常に高い
  - 80単語を超えるとほぼ確実に切り捨てられる

ベストプラクティス:
- 核となるコンセプトに集中し、余分な詳細は除外
- 「very」などの修飾語を避け、より正確な同義語を使用（例: "very big" → "gigantic"）
- 簡潔でも記述的な言語を使用

## 3. 避けるべきパターン

### 3.1 曖昧な表現
- ❌ 悪い例: "a nice scene with some trees"
- ✅ 良い例: "a serene lakeside landscape with three tall pine trees at sunset"
- 理由: 曖昧な言語は様々な解釈が可能で、予期しない結果につながる。「nice」「some」などの不明確な語は避ける。

- ❌ 悪い例: "big animal"
- ✅ 良い例: "gigantic elephant with large tusks"
- 理由: サイズや特徴を具体的に記述することで、意図した結果が得られやすくなる。

- ❌ 悪い例: "painting of a woman looking at it"
- ✅ 良い例: "oil painting of a woman in a red dress looking at a sunset over mountains"
- 理由: 代名詞（"it"）は参照先が不明確。すべての要素を明示的に記述する。

### 3.2 過度な詳細
- 40単語を超える詳細は無視される可能性が高い
- 核となるコンセプト以外の細かい詳細を詰め込みすぎない
- 例: 不要な装飾語、重複する表現、矛盾する指示を避ける
- 詳細すぎて逆効果になるケース: "a very extremely super detailed ultra high resolution photorealistic 8K HDR masterpiece quality perfect flawless..." など、品質修飾語を過剰に連ねる

### 3.3 矛盾する指示
- ❌ "bright sunny day with dark moody atmosphere" - 明るい晴天と暗いムードは矛盾
- ❌ "minimalist design with intricate details everywhere" - ミニマルと複雑な詳細は対立
- ❌ "photorealistic cartoon" - 写実的と漫画調は両立しない
- 矛盾が発生しやすいパターン: 相反するスタイル、矛盾する照明条件、対立する色調を同時に指定すること

### 3.4 抽象的概念の指定
- Midjourneyは具体的な主題、オブジェクト、シーン、構図に最適化されている
- ❌ 避けるべき: "happiness", "love", "justice", "freedom"などの抽象概念
- ✅ 推奨: 抽象概念を視覚的要素に置き換える（例: "happiness" → "smiling children playing in a sunny park"）

### 3.5 明確な焦点の欠如
- 主題や焦点が不明確なプロンプトは避ける
- ❌ "various things in a room" - 焦点が定まっていない
- ✅ "vintage typewriter on a wooden desk, centered composition" - 明確な焦点

## 4. モデル固有の構文・機能

### 4.1 特殊構文

#### マルチプロンプト重み付け（`::`）
- プロンプト内で概念を分離し、各部分に異なる重みを割り当てる
- 構文: `[要素1]::[重み] [要素2]::[重み]`
- デフォルト重み: 1.0
- 対応バージョン: V1-3（整数のみ）、V4以降（小数点可能）
- ネガティブな重み（例: `-0.5`）で要素を抑制可能

#### ネガティブプロンプト（`--no`）
- 構文: `--no [除外要素]`
- `--no [要素]`は`::[要素]::-0.5`と同等
- 複数要素は1つの`--no`の後にスペース区切りで指定

### 4.2 パラメータ

パラメータはプロンプトテキストの**後**に、スペースを空けて追加する。

#### `--aspect` または `--ar`
- アスペクト比を指定
- 構文: `--ar [幅]:[高さ]`
- デフォルト: `1:1`（正方形）
- 例: `--ar 16:9`（ワイドスクリーン）、`--ar 9:16`（ポートレート）
- 注意: 小数点は使用不可（例: `1.39:1` → `139:100`）

#### `--quality` または `--q`
- 生成品質（処理時間）を調整
- 値: `.25`, `.5`, `1`（デフォルト）
- 高い値ほど詳細だが処理時間が増加
- 対応: V4, V5, Niji 5

#### `--seed`
- 初期ノイズフィールドを指定（再現性のため）
- 値: 0〜4294967295の整数
- 同じシード+同じプロンプト = 類似した結果

#### `--chaos` または `--c`
- 初期グリッドのバリエーション度を制御
- 値: 0（デフォルト）〜100
- 高い値ほど予測不可能で独創的な結果

#### `--stylize` または `--s`
- Midjourney独自の芸術的解釈の強度を調整
- 値: 0〜1000（デフォルト: 100）
- 低い値: プロンプトに忠実
- 高い値: より芸術的で創造的

#### `--style`
- モデルの特定スタイルバリエーションを有効化
- V5.1/5.2: `--style raw`（デフォルトスタイルを減少、よりシンプルで「生」な見た目）
- Niji 5: `--style cute`, `--style scenic`, `--style expressive`, `--style original`
- V4: `--style 4a`, `--style 4b`, `--style 4c`

#### `--niji`
- アニメスタイル専用モデルを有効化
- 構文: `--niji 5` または `--niji 6`
- Nijiモードと`--style`パラメータを組み合わせ可能

#### パラメータ使用例
```
a serene mountain landscape at sunrise --ar 16:9 --q 1 --s 250
portrait of a samurai warrior --niji 6 --style expressive --ar 2:3
abstract geometric art --chaos 75 --stylize 500 --seed 12345
futuristic city skyline --ar 21:9 --q .5 --no cars people
```

## 5. プロンプト例

### 5.1 基本例
```
a fluffy orange cat sitting on a windowsill, soft morning light
```

```
mountain landscape at sunrise with mist, golden light, peaceful atmosphere
```

```
portrait of a young woman with curly hair, natural lighting, warm colors
```

### 5.2 高度な例
```
ultra-realistic portrait of a young woman with freckles and green eyes, soft natural window lighting, Canon EOS R5 F2 ISO100, shallow depth of field, bokeh background, warm skin tones, 8K, photorealistic --ar 2:3 --style raw --q 1
```

```
cyberpunk cityscape at night::2 neon signs::1.5 flying cars::1, rain-soaked streets reflecting lights, cinematic composition, blade runner aesthetic, dramatic lighting, highly detailed, 8K --ar 21:9 --s 300 --c 20
```

```
serene Japanese zen garden, perfectly raked gravel patterns, ancient stone lantern, cherry blossom tree, soft diffused lighting, minimalist composition, tranquil atmosphere, shot with Hasselblad X2D, shallow depth of field --ar 4:5 --q 1 --no people
```

### 5.3 スタイル別例

#### 写実的（Photorealistic）
```
professional food photography of a gourmet burger, sesame seed bun, melted cheese, fresh lettuce and tomato, studio lighting setup, Canon EOS 5D Mark IV, 100mm macro lens, shallow depth of field, commercial advertising style, high-end restaurant quality --ar 4:5 --style raw
```

```
wildlife photography of a majestic lion in golden savanna grassland, sunset golden hour lighting, Sony A7R IV, 600mm telephoto lens, National Geographic style, award-winning composition, 8K --ar 16:9 --q 1
```

#### イラスト（Illustration）
```
whimsical children's book illustration of a friendly dragon reading a book under a tree, soft watercolor style, pastel colors, charming and warm atmosphere, storybook aesthetic, hand-drawn feel
```

```
retro 1980s anime style, cel-shaded portrait of a girl in a cafe, vintage fashion, muted pastel colors, nostalgic aesthetic, by Tsukasa Hojo, dramatic lighting --niji 6 --style expressive
```

#### 抽象的（Abstract）
```
bold abstract expressionist composition, explosive splashes of vibrant color, dynamic brush strokes, emotionally charged, inspired by Jackson Pollock, large canvas feel, modern art gallery aesthetic
```

```
minimalist geometric abstract art, overlapping circles and triangles, limited color palette of blue and orange, clean lines, modernist composition, Bauhaus influence --ar 1:1 --s 500
```

#### その他（コンセプトアート、ファンタジー）
```
epic fantasy landscape concept art, floating islands in the sky::2 ancient ruins::1.5 waterfalls cascading into clouds, magical atmosphere, dramatic volumetric lighting, matte painting style, trending on ArtStation --ar 21:9 --s 400
```

```
cyberpunk character design, female hacker with neon implants, tactical gear, holographic interface, dark urban background, cinematic lighting, highly detailed, digital painting, concept art for video game --ar 2:3
```

## 6. よくある問題と解決策

### 6.1 問題: 望まない要素が生成される
- 原因: 「don't」「without」などの自然言語での否定は機能せず、逆にその要素を強調する可能性がある
- 解決策:
  - `--no [除外要素]`パラメータを使用
  - または、ネガティブな重み付け（例: `red::-0.5`）を使用
  - ポジティブな指示を優先（「〜を避ける」ではなく「〜にする」）
  - 例: `portrait --no glasses jewelry` または `portrait:: glasses::-0.5`

### 6.2 問題: 生成結果が曖昧で意図と異なる
- 原因: プロンプトが抽象的、曖昧、または焦点が不明確
- 解決策:
  - 具体的で視覚的な描写を使用
  - 明確な主題と焦点を設定
  - 代名詞や暗黙の参照を避ける
  - 形容詞・副詞を追加してニュアンスを明確化
  - 例: "beautiful scene" → "serene lakeside at sunset with golden light reflecting on calm water"

### 6.3 問題: 特定の要素が無視される
- 原因: プロンプトが長すぎる（40単語以上）、または要素の優先度が明確でない
- 解決策:
  - プロンプトを40単語以下に短縮
  - 重要な要素は前方に配置
  - `::`による重み付けを使用して要素の重要度を明示
  - 例: `space::2 ship astronaut::1.5` - 宇宙が最も重要、次に宇宙飛行士、船は最も低い

### 6.4 問題: スタイルが一貫しない
- 原因: 矛盾するスタイル指示、または複数の相反する美的方向性
- 解決策:
  - 1つの明確なスタイル方向性を選択
  - 矛盾する形容詞を避ける（例: "minimalist"と"highly detailed"を同時に使わない）
  - 特定のアーティスト、時代、スタイルを参照
  - `--style`パラメータを活用（例: `--style raw`, `--niji 6 --style cute`）

### 6.5 問題: 写実的な画像にMidjourneyの「アート的」な要素が入る
- 原因: デフォルトでMidjourneyは芸術的解釈を加える
- 解決策:
  - `--style raw`パラメータを使用
  - `--stylize`の値を下げる（例: `--s 50`）
  - カメラモデルやレンズを具体的に指定
  - 「photograph」「raw image」「photorealistic」などの語を含める
  - 例: `portrait photography --style raw --s 50` または `street photography, Canon EOS R5, 35mm lens, natural lighting --style raw --ar 3:2`

### 6.6 問題: 結果のバリエーションが不足
- 原因: `--chaos`値が低い（デフォルト0）、または`--seed`を固定している
- 解決策:
  - `--chaos`値を上げる（例: `--c 50`〜`--c 100`）
  - シード値を指定しない（ランダムシードを使用）
  - プロンプトの語順や表現を変える
  - 例: `fantasy landscape --chaos 80 --stylize 600`

## 7. ベストプラクティスまとめ

1. **シンプルさと具体性のバランス**: 5〜40単語を目安に、具体的で視覚的な描写を使用する。抽象的な概念は避け、視覚化可能な要素に置き換える。

2. **重み付けで優先度を制御**: 重要な要素には`::`を使った重み付けを活用し、明確に優先度を指定する。単なる順序だけでなく、数値による制御を行う。

3. **ネガティブプロンプトは慎重に**: `--no`パラメータは必要な場合のみ使用し、具体的な除外要素を明示する。自然言語での否定（"don't", "without"）は避ける。

4. **パラメータを戦略的に使用**: `--ar`でアスペクト比、`--style raw`で写実性、`--chaos`で創造性、`--stylize`で芸術性を調整。目的に応じて適切なパラメータを選択する。

5. **明確な焦点と一貫したスタイル**: 主題を明確にし、矛盾するスタイル指示を避ける。1つの美的方向性を維持し、特定のスタイル参照（アーティスト名、時代、技法など）を使用する。

---

**更新日**: 2025-11-04
**対象モデル**: Midjourney (V4, V5, V5.1, V5.2, V6, V6.1, V7, Niji 5, Niji 6)
**参照ソース**:
- Midjourney公式ドキュメント（docs.midjourney.com）
- Multi-Prompts & Weights公式ガイド
- Prompt Basics公式ガイド
- Parameter List公式ガイド
- コミュニティベストプラクティス（2025年版）
- 各種技術ブログ・チュートリアル
