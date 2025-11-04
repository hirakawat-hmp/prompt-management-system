# 画像生成プロンプトTips - Google Imagen 4

> このドキュメントはGoogle Imagen 4における効果的なプロンプト作成テクニックをまとめたものです。
> LLMがプロンプト生成・改善時に参照することを想定しています。

## 1. プロンプト構造の基本

### 1.1 必須要素

- **主題（Subject）**: 画像に含める主要なオブジェクト、人物、動物、またはシーンの詳細な説明。「猫」ではなく「long-haired orange tabby cat sitting on a windowsill」のように具体的に記述することが重要です。

- **スタイル（Style）**: 生成する画像の視覚的なアプローチ。一般的なスタイル（photograph、painting、sketch）から特定のスタイル（vintage travel postcard、charcoal drawing、isometric 3D illustration）まで指定します。

- **品質修飾語（Quality modifiers）**: 出力品質を示すキーワード群。「high-quality」「professional quality」「4K」「detailed」「sharp focus」などを使用し、望む品質レベルを明確にします。

### 1.2 推奨要素

- **構図（Composition）**: カメラアングル、視点、レイアウトを指定。「close-up」「wide-angle shot」「bird's eye view」「low-angle shot」などで被写体の見え方を制御します。

- **照明（Lighting）**: 光の質と方向を記述。「golden hour lighting」「warm, soft afternoon sunlight」「dramatic low-key lighting」「studio lighting with three-point setup」などで雰囲気を設定します。

- **色彩（Colors）**: 色パレットと色調を指定。「warm color palette with golden tones」「cool blue and silver aesthetic」「monochrome black and white」「vibrant jewel tones」のように色の雰囲気を示します。

- **その他**: シーンの時間帯、季節、天候、背景要素、被写体の動作や表情、テクスチャ、素材など、より詳細な文脈を追加します。

### 1.3 要素の推奨順序

```
[主題の詳細な説明], [シーンの文脈・背景], [カメラアングル・構図],
[照明の詳細], [色彩・雰囲気], [スタイル], [品質修飾語]
```

**例**:
```
A professional photograph of a young woman with striking red hair,
sitting in a pickup truck cabin, visible from the driver's seat angle.
The scene is illuminated by golden hour sunlight casting long warm shadows
across her contemplative face. Beyond the dusty highway visible through
her side window, a vast desert landscape stretches toward hazy mountains.
The interior is bathed in warm, cinematic lighting.
Shot with professional camera, sharp focus, 4K resolution, cinematic quality.
```

## 2. 効果的な記述テクニック

### 2.1 具体性

プロンプトは曖昧さを排除し、できる限り具体的・詳細に記述する必要があります。Imagen 4は深い言語理解を持つため、キーワード羅列ではなく自然な説明がより効果的です。

- **❌ 悪い例**: "beautiful cat in a room"
- **✅ 良い例**: "A long-haired orange tabby cat with striking green eyes, lounging on a sunlit window sill. Soft afternoon light filters through white lace curtains, creating gentle shadows on the cat's fur. The room features vintage wooden furniture and potted plants in the background."
- **理由**: 具体的な詳細（毛並みの長さ、色、目の色、光の質、背景要素）により、Imagen 4はより正確で期待に近い画像を生成できます。

### 2.2 重み付け・強調

Imagen 4は負のプロンプトをサポートしていないため、強調は肯定的な記述で行います。重要な要素を強調する場合、詳細さの度合いを増やすことで優先度を示します。

- 重要な要素には複数の描写的用語を使用: 「clear, sharp focus, incredibly detailed」
- 背景や二次的要素には簡潔な説明を使用: 「blurred background」「subtle pattern」
- 視覚的な優先度を示すには、説明の順序を活用: 最初に強調したい要素を記述

### 2.3 否定表現の扱い

Imagen 4は負のプロンプットに対応していないため、除外したい要素については**肯定的な言い方で代替要素を指定**します。

- **❌ 避けるべき方法**: "A portrait without blur, not abstract" などの否定表現
- **✅ 推奨方法**:
  - 除外したい要素の代わりに望ましい状態を説明
  - 例: "blurred background" の代わりに、「sharp focus on face, creamy bokeh background」
  - 「plain background」の代わりに、「soft neutral background」

- **注意点**: 否定的指示よりも肯定的な指示の方がImagen 4では効果的です。生成したくない要素について直接述べるのではなく、その代わりに何を生成したいかを明確に述べてください。

### 2.4 長さの最適化

- **推奨文字数/単語数**: 30～150単語（トークン制限は480トークン）
- **理由**:
  - 短すぎるプロンプト（10語以下）は曖昧になり、一貫性のない結果をもたらします
  - 適度に詳細なプロンプト（30～150単語）は最高の精度と創造性のバランスを実現します
  - 480トークンの制限に余裕を持たせることで、モデルの処理能力を効率的に使用できます

**実践的なアプローチ**:
1. 中核となるアイデアを簡潔に述べる（15～20単語）
2. 詳細と文脈を段階的に追加（追加30～60単語）
3. 必要に応じてさらに洗練させる（最終的に100～150単語程度）

## 3. 避けるべきパターン

### 3.1 曖昧な表現

- **❌ 悪い例**: "A beautiful woman in a nice place"
- **✅ 良い例**: "A woman with porcelain skin and sharp cheekbones, wearing a flowing emerald gown, standing in a grand marble hall with soaring columns and soft golden light"
- **理由**: 「beautiful」「nice」は主観的で、Imagen 4が正確な視覚的指示を受け取れません。具体的な視覚的特性を記述することで、より期待に沿う結果が得られます。

### 3.2 過度な詳細

複数の矛盾する詳細や、複雑すぎる指示は処理を困難にします：

- **❌ 悪い例**: "A photorealistic oil painting of a golden hour watercolor illustration of a digital 3D rendered scene with hand-drawn elements in an animated style"
- **✅ 良い例**: "A watercolor illustration, soft golden hour lighting, detailed brushwork, serene atmosphere"
- **理由**: スタイルの混在や相互に排他的な指示は、モデルを混乱させます。一つのコヒーレントなビジュアルコンセプトに焦点を当ててください。

### 3.3 矛盾する指示

特に以下の組み合わせは避けてください：

- 複数の異なる芸術様式の混在（「oil painting」と「digital 3D render」を同時に指定）
- 物理的に不可能な光の条件（「bright sunny day」と「midnight darkness」の同時指定）
- 相反するトーンや雰囲気（「cheerful and vibrant」と「dark and melancholic」の同時指定）

## 4. モデル固有の構文・機能

### 4.1 特殊構文

Imagen 4では、他の画像生成モデルに比べて構文上の制約が少なく、自然言語の叙述が最も効果的です。

- **否定プロンプトは非対応**: 「without」「no」「avoid」という否定指示は機能しません。代わりに肯定的な代替案を記述してください。
- **重み付け記号は非対応**: DALL-Eやその他のモデルのような「::」や「weight」構文は使用できません。
- **括弧による強調は限定的**: () や [] による強調は効果的ではありません。代わりに詳細さを増やしてください。

### 4.2 パラメータ

プロンプト外の主要パラメータ：

- **prompt**: テキストプロンプト（最大480トークン）
- **sampleCount**: 生成画像数（1～4、デフォルト1）
- **aspectRatio**: アスペクト比（1:1, 4:3, 3:4, 16:9, 9:16）
- **safety_settings**: 安全フィルタリングレベル
- **enhancePrompt**: プロンプト強化機能（オプション、複雑なプロンプトでは false に設定することを推奨）

## 5. プロンプト例

### 5.1 基本例

```
A cozy reading nook on a rainy afternoon.
A comfortable armchair bathed in warm lamplight sits beside a tall window,
raindrops visible on the glass. Nearby, a wooden bookshelf is filled with
colorful books, and a steaming cup of tea sits on a small side table.
Soft, diffused light creates a peaceful atmosphere.
```

### 5.2 高度な例

```
Filmed cinematically from the driver's seat, offering a clear profile view
of a young woman with striking red hair sitting in the front passenger seat
of a pickup truck. Her gaze is fixed ahead with concentrated expression,
looking out through her side window at a dusty, lonely highway. Beyond the window,
dry earth and hazy, distant mountains are visible but slightly blurred.
Late afternoon sun casts long shadows and warm golden highlights across her face
and the truck's weathered interior. The lighting emphasizes her solitary presence
within the vast, empty desert landscape. Shot with professional cinema camera,
cinematic color grading, sharp focus, 4K resolution.
```

### 5.3 スタイル別例

**写実的（Photorealistic）**:
```
A professional product photograph of a luxury wristwatch.
Shot with macro lens, the watch face is sharp and centered,
displaying precise details of the dial and hands. Soft,
three-point studio lighting with warm key light and subtle fill light
creates elegant shadows and highlights on the polished metal and glass.
Neutral white background, high-end commercial photography style,
pristine quality, 4K resolution.
```

**イラスト（Illustration）**:
```
A vintage travel poster illustration of a Mediterranean coastal town.
Art deco style with geometric shapes and bold, simplified forms.
Warm color palette with golden yellows, deep blues, and terracotta oranges.
A whitewashed village cascades down a hillside toward turquoise water,
with sailboats in the harbor. Bold graphic lines, limited color palette,
decorative typography at bottom. Classic 1930s travel poster aesthetic.
```

**抽象的（Abstract）**:
```
An abstract composition exploring movement and transformation.
Flowing forms in shades of deep indigo, silver, and white create a sense
of swirling motion and energy. Organic shapes blend and merge seamlessly,
suggesting water, light, and metamorphosis. Soft, diffused lighting with
areas of high contrast. Digital art aesthetic with painterly textures,
dreamlike and ethereal quality.
```

**ファッション編集（Fashion Editorial）**:
```
High fashion editorial photograph of a model wearing an avant-garde
sculptural dress with exaggerated silhouette and geometric construction.
Shot on location in a minimalist concrete warehouse with soaring ceilings.
Hard directional lighting from the side creates dramatic shadows and
emphasizes the dress's sculptural form. Neutral gray background,
cinematic color grading with desaturated tones and cool highlights.
Editorial fashion photography, high-fashion aesthetic, 4K quality.
```

## 6. よくある問題と解決策

### 6.1 問題: 生成結果がプロンプトの意図から外れている

- **原因**: プロンプトが曖昧または相反する指示を含んでいる。または、記述が不十分で、モデルが複数の解釈可能性を持つ。
- **解決策**:
  1. 主要要素に対してより詳細な説明を追加
  2. スタイルと構図の指示を具体化（「painting」ではなく「impressionist oil painting」）
  3. イテレーティブな改善：プロンプトを段階的に修正し、各反復で1～2つの要素のみを調整

### 6.2 問題: テキスト要素が正確に生成されない、またはテキストが読みづらい

- **原因**: テキスト指定が長すぎる（25文字以上）、または複雑なフォント要求が不明確。
- **解決策**:
  1. テキストを最大25文字に制限（「WELCOME」「Open Daily」など短い表現のみ）
  2. フォントスタイルは一般的な説明に留める（「modern sans-serif」「elegant script」）
  3. 「large text」「bold letters」など相対的なサイズで指定
  4. テキストの配置を明確に指定（「top center」「bottom right」）

### 6.3 問題: 色彩が期待と異なる

- **原因**: 色についての指示が不十分または抽象的。照明の指示と色指示が矛盾している。
- **解決策**:
  1. 具体的な色指定を使用（「cobalt blue」「burnt sienna」「sage green」）
  2. 色パレットを全体的に記述（「warm earthy palette」「cool jewel tones」）
  3. 照明条件を明確に指定（色は照明に影響を受けるため）
  4. 色の量や分布を指定（「predominantly blue with warm accents」）

### 6.4 問題: 背景が乱雑または気を散らす

- **原因**: 背景について指示がないか不明確な場合、Imagen 4は詳細な背景を生成することがあります。
- **解決策**:
  1. 背景を明確に指定（「blurred background」「plain white studio background」「soft neutral blur」）
  2. ボケ効果を詳細に説明（「creamy bokeh」「gentle blur」）
  3. 背景色を指定（「soft gray background」「light background」）
  4. 背景の深度感を制御（「shallow depth of field」「sharp throughout」）

### 6.5 問題: 複雑なシーンが生成されない、または要素が不適切に配置される

- **原因**: 複数の要素が明確に記述されていない。空間的な関係が曖昧。
- **解決策**:
  1. シーンを層で分解（前景、中景、背景）
  2. 要素間の空間的関係を明示（「in the foreground」「in the distance」「to the left」）
  3. 視点を明確に（「bird's eye view」「from below」「medium shot」）
  4. 各要素に対して詳細を提供し、相互の関係性を説明

## 7. ベストプラクティスまとめ

1. **具体性と詳細性を優先する**：キーワード羅列ではなく、自然な叙述的プロンプトを書く。「cat」ではなく「a fluffy orange tabby cat with striking green eyes」と記述。

2. **三要素フレームワーク（Subject, Context, Style）を活用する**：すべてのプロンプトは「何を」「どこで」「どのように」の三要素で構成。

3. **イテレーティブに改善する**：最初のプロンプトで完璧を目指さず、結果を見てから段階的に調整。1回の修正で1～2つの要素のみを変更。

4. **照明と色彩を明確に指定する**：「golden hour lighting」「warm soft light」など、具体的な照明について記述。色パレット全体を考慮。

5. **避けるべき構文を認識する**：負のプロンプト、重み付け記号、括弧による強調はImagenでは機能しない。肯定的な代替指示を使用。

6. **テキスト要素を簡潔に保つ**：画像内のテキストは最大25文字に制限し、シンプルなフォントスタイルを指定。

7. **アスペクト比を活用する**：1:1（正方形）、4:3、16:9など、目的に応じて適切なアスペクト比を指定。

8. **プロンプト強化（enhancePrompt）を慎重に使用**：複雑なプロンプトの場合、モデルが勝手に修正してしまわないよう false に設定することを検討。

9. **品質修飾語を戦略的に使用する**：「professional quality」「high-resolution」「detailed」などは効果的ですが、過剰使用は避ける。

10. **Imagen 4 Ultra vs 標準Imagen 4を使い分ける**：プロンプト指示への厳密な準拠が必要な場合はUltraを、クリエイティブな解釈が必要な場合は標準を選択。

---

**更新日**: 2025-11-04
**対象モデル**: Google Imagen 4 (imagen-4.0-generate-001)
**参照ソース**:
- Google Cloud Vertex AI 公式ドキュメント（Prompt and image attribute guide）
- Google AI for Developers - Imagen Prompt Guide
- Google DeepMind - Imagen 4 公式アナウンス
- Google Developers Blog - Imagen 4 at Gemini API
- Medium - "The Art of the Ask: Mastering Prompts for Imagen on Vertex AI"

---
