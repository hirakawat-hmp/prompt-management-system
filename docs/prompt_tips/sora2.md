# 動画生成プロンプトTips - OpenAI Sora 2

> このドキュメントはOpenAI Sora 2における効果的なプロンプト作成テクニックをまとめたものです。
> LLMがプロンプト生成・改善時に参照することを想定しています。

## 1. プロンプト構造の基本

### 1.1 必須要素
- **主題（Subject）**: キャラクター、オブジェクト、または被写体を具体的に記述。「猫」ではなく「銀色の縞模様の猫」のように詳細化する
- **アクション/モーション（Action/Motion）**: 具体的な動作を時間的なビート（拍）で記述。「歩く」ではなく「窓まで4歩歩き、一時停止し、最後の1秒でカーテンを引く」のように分解する
- **スタイル（Style）**: 「1970年代のフィルム」「16mmモノクロ」「IMAX規模の壮大なシーン」など視覚的な美学を早期に確立
- **品質修飾語（Quality modifiers）**: 具体的な視覚的詳細。「美しい夜の通り」ではなく「濡れたアスファルト、横断歩道のゼブラ模様、水たまりに映るネオンの反射」

### 1.2 推奨要素
- **カメラワーク（Camera movement）**: カメラの動き（ドリーイン、パン、チルトなど）を1ショットにつき1つ明確に指定
- **構図（Composition）**: ワイドショット、ミディアムクローズアップ、アングル（ローアングル、ハイアングル等）を具体的に記述
- **照明（Lighting）**: 光の質と方向を指定。「明るい部屋」ではなく「窓からの柔らかい光、暖かいランプの補助光、廊下からの冷たいリム光」
- **時間軸の流れ（Temporal flow）**: アクションをビート（拍）やカウント、間（ポーズ）で時間軸に基づいて記述
- **その他**:
  - **被写界深度**: 浅い焦点（被写体にシャープ、背景ぼかし）vs 深い焦点
  - **カラーパレット**: 3〜5色の色を指定して安定性を維持（例：アンバー、クリーム、ウォールナットブラウン）
  - **環境音/対話**: 静かなシーンでも「遠くの交通の音」などのリズム指標

### 1.3 要素の推奨順序
```
1. カメラショット定義とフレーミング詳細（Wide shot, low angle）
2. キャラクター/被写体の配置とアクション（Actor takes four steps to the window）
3. カメラ動作の指示（方向/ペース含む）（Slow tracking left to right）
4. 環境の文脈詳細（Cluttered workshop, yellowing blueprints）
5. 照明/ムードの指定（Soft window light with warm lamp fill）
6. カラーパレット指定（Palette: amber, cream, walnut brown）
7. 対話ブロック（別ブロックで記述）
```

## 2. 効果的な記述テクニック

### 2.1 モーションの記述
- **動きをビート（拍）で分解**: 「アクターが部屋を横切る」ではなく「アクターが窓まで4歩歩き、一時停止し、最後の1秒でカーテンを引く」
- **1ショットに1つの明確なカメラ動作と1つの明確な被写体アクション**: 複数の動きを混在させない
- **動詞と動作記述子を使用**: 「歩く」「走る」「飛ぶ」「漂う」「回転する」「揺れる」「カメラがドリーイン」「ステディカムショット」
- 例:
  - ❌ 悪い例: "Person moves quickly"
  - ✅ 良い例: "Cyclist pedals three times, brakes, stops at crosswalk"

### 2.2 カメラワークの指定
- **明示的な指示を使用**: 「ワイドショット、ローアングル」「ミディアムクローズアップ、やや後ろからのアングル」「空中ワイドショット、やや下向きアングル」
- **パターン**:
  - **パン**: 水平方向のスイープ（"Pan left 30° over 2 seconds"）
  - **チルト**: 垂直方向のピボット（"Tilt up to capture the rising sun"）
  - **ドリー**: 深度の変化（"Slow push in 3 seconds", "Dolly in from eye level"）
  - **トラッキングショット**: アクションを追従（"Tracking shot following the runner"）
  - **特殊技法**: ウィップパン（素早い遷移）、ステディカム（流動的な連続性）、ハンドヘルドENGカメラ
- **レンズ指定**: 「32mmスフェリカルプライム」「85mmレンズ」「24mm広角」
- **複雑なレイヤード動作**: 「左へパンしながらドリーインを開始し、その後チルトアップして昇る太陽を捉える」

### 2.3 時間軸の制御
- **短いクリップを推奨**: モデルは短いクリップでより確実に指示に従う。8秒の1クリップより、4秒の2クリップを編集で繋ぐ方が良い結果が得られることが多い
- **タイムスタンプで進行を記述**: 「0:00にスタート。0:05で色が端から滲み始める。0:09で完全に鮮やかな色が確立」
- **時間的ビート**: 「彼女は4歩歩き、止まり、手を上げ、カメラは最後のフレームでドリーイン」
- 注意点: 長い持続時間（12秒以上）は一貫性の問題のリスク（例：キャラクターのシャツの色が変わる）。8〜10秒が理想

### 2.4 重み付け・強調
- **繰り返しと視覚的アンカー**: 「青いバックパック」のような小さなアイテムでも、一度言及し、その後も見えるようにすることで連続性を維持
- **具体的な色とライティングロジック**: 3〜5色を指定することでショット間の安定性を保つ
- 構文: Sora 2には特殊な重み付け構文（Stable Diffusionの`(concept:1.5)`のようなもの）は公式にはないが、詳細な記述と繰り返しが強調効果を持つ

### 2.5 否定表現の扱い
- **プロンプト内に除外を組み込む**: 「ダッチアングルを避ける；画面上のテキストなし；レンズフレアなし」のようにプロンプト内に記述すると遵守率が向上
- **品質制約の否定**: 「ピクセル化なし、圧縮アーティファクトなし、時間的グリッチなし、オーディオの非同期なし」
- **解剖学的問題の防止**: 「一貫したキャラクターのプロポーションを維持—解剖学的歪みなし」
- **スタイル的境界**: 「リアルなシーンで漫画的誇張なし；時代劇に現代要素なし；時代錯誤的な技術なし」
- **物理制約**: 「リアルな重量—浮遊物体なし；一貫した重力方向；瞬間的な加速なし；衝撃間で保存される運動量」
- 注意点: 正式な「ネガティブプロンプト」パラメータは存在しないため、プロンプト本文内に自然な文章として組み込む

### 2.6 長さの最適化
- 推奨文字数/単語数: 中程度の詳細度で50〜200単語が一般的。過度に短いと曖昧、過度に長いと焦点が分散
- 理由: プロンプトは「創造的なウィッシュリスト」であり、「契約」ではない。明確さと創造的自由のバランスが重要

## 3. 避けるべきパターン

### 3.1 曖昧な表現
- ❌ 悪い例: "Beautiful street at night", "Cinematic look", "Person moves"
- ✅ 良い例: "Wet asphalt, zebra crosswalk, neon reflections in puddles", "Wide shot, low angle; shallow depth of field; warm backlight with soft rim", "Cyclist pedals three times, brakes, stops at crosswalk"
- 理由: 具体性がないと、モデルが即興で補完し、意図しない結果になる。撮影監督にストーリーボードを見せずに指示するようなもの

### 3.2 過度な詳細
- **オブジェクトの羅列**: 「冷蔵庫、オーブン、電子レンジ、トースター、マグカップのあるキッチン」のように多数のオブジェクトを列挙すると、Sora 2がショット内の人物を忘れることがある
- **推奨**: 「ビンテージ冷蔵庫のある居心地の良いキッチン—ボウルにミルクを注ぐ人に焦点」のように焦点を絞る
- **過度に複雑なアクション**: 「3回転と跳躍をするダンサー」のような多数の動作を一度に要求しない。Sora 2は複雑すぎる動作に苦戦する

### 3.3 矛盾する指示
- **時間スケールの矛盾**: 「スローモーション爆発のある高速カーチェイス」は時間的矛盾を生む。「リアルタイムのチェイスとリアルタイムの爆発」または「全体を120fpsのスローモーション」で統一
- **複数のカメラ動作**: 1ショットに複数のカメラ動作を混ぜない。1つの動作に集中
- **スタイルの混在**: 「リアルなシーンで漫画的誇張」のような矛盾を避ける

### 3.4 不自然なモーション
- **物理的に不可能な動作**: 瞬間的な加速、浮遊する物体、重力方向の不一致など
- **解決策**: 「リアルな重量」「一貫した重力方向」「衝撃間で保存される運動量」を明示

## 4. モデル固有の構文・機能

### 4.1 特殊構文
- **正式な特殊構文はなし**: Sora 2はStable DiffusionやMidjourneyのような`(concept:1.5)`や`::`のような特殊構文を持たない
- **代替手法**: 詳細な記述、繰り返し、具体的な形容詞による強調

### 4.2 パラメータ
- **API呼び出しで設定が必要（プロンプト文内では指定不可）**:
  - **model**: `sora-2` または `sora-2-pro`
  - **size**: サポートされる解像度（1280x720, 720x1280など）
  - **seconds**: "4", "8", または "12"秒
- **プロンプト文で「もっと長く」と書いても効果なし**: パラメータとして明示的に設定する

### 4.3 動画特有の設定
- 長さ（Duration）: APIパラメータ`seconds`で設定（4, 8, 12秒）。プロンプト内で「10秒のクリップ」と記述しても無効
- アスペクト比: APIパラメータ`size`で設定（1280x720、720x1280、1024x1024など）
- フレームレート: 明示的なフレームレート指定パラメータは公式ドキュメントに記載なし。スローモーション効果は「120fpsのスローモーションキャプチャ」とプロンプト内で記述

## 5. プロンプト例

### 5.1 基本例
```
A rainy neon alley in Tokyo at night; medium close-up on a courier adjusting his helmet; 35mm lens, shallow depth of field; handheld camera pushing in slowly; wet asphalt glistening; moody, synthwave palette.
```

```
Wide shot, low angle. A silver tabby cat knocking over a cup on a wooden table. Natural window light. Slow dolly in.
```

### 5.2 高度な例
```
Inside a cluttered workshop, shelves overflow with gears, bolts, and yellowing blueprints. At the center, a small round robot sits on a wooden bench, its dented body patched with mismatched plates and old paint layers. Its large glowing eyes flicker pale blue as it fiddles nervously with a humming light bulb. The air hums with quiet mechanical whirs, rain patters on the window, and the clock ticks steadily in the background.

Camera: Medium close-up, slight angle from behind, 50mm lens, shallow focus (sharp on robot, blurred shelves). Slow push-in over 4 seconds.

Lighting: Soft overhead tungsten lamp casting warm glow on bench; cool blue ambient from window; subtle rim light from distant desk lamp. Deep shadows in corners. Palette: brass, walnut brown, slate blue, warm cream.

Actions:
0–1s: Robot sits still, eyes flicker.
1–2s: Robot picks up light bulb, tilts head.
2–4s: Robot turns bulb slowly, eyes glow brighter.

Sound: Quiet mechanical whirring (ambient), rain tapping (distant), clock ticking (rhythmic).
```

### 5.3 スタイル別例
- **写実的**:
```
Professional skateboarder performs a kickflip down a 10-stair set in an urban plaza. Slow-motion capture at 120fps showing board rotation and rider's focused expression. Concrete textures and afternoon sunlight creating dramatic shadows. Sound of wheels grinding and board slapping pavement.
```

- **アニメーション**:
```
Hand-drawn 2D animation style. A fox in a red scarf leaps through a snowy forest. Watercolor backgrounds, pencil outlines. Whimsical, Studio Ghibli aesthetic. Soft piano melody.
```

- **抽象的**:
```
Abstract fluid simulation. Iridescent liquid morphs through geometric shapes—sphere to cube to pyramid. Metallic reflections, prism light refractions. Electronic ambient soundscape.
```

- **その他（ノワール）**:
```
Black-and-white 1940s film noir. Detective walks through rain-soaked street, trench coat collar up. High-contrast shadows from streetlamp. Low angle, slow dolly tracking. Jazz saxophone in distance.
```

### 5.4 カメラワーク別例
- **静止カメラ**:
```
Static camera, tripod-mounted. Wide shot of a coffee shop interior. Customers enter and exit naturally. Natural morning light through large windows. Ambient café sounds—espresso machine, quiet conversation.
```

- **パン/チルト**:
```
Camera pans left to right, 30° over 3 seconds. A calm sunrise over a small coastal town, rooftops to harbor. Warm golden light washing over terracotta roofs. Soft ambient sound of distant seagulls and gentle waves.
```

- **ズーム**:
```
Slow zoom in, 24mm to 50mm equivalent over 6 seconds. Face of an elderly woman reading a letter by candlelight. Emotion builds as camera closes in. Soft candle flicker, paper rustling.
```

- **トラッキング**:
```
Steadicam tracking shot following a runner through a park at dawn. Camera moves fluidly alongside, capturing stride rhythm and breathing. Dappled sunlight through trees. Footsteps on gravel path, bird songs.
```

## 6. よくある問題と解決策

### 6.1 問題: 曖昧な結果・意図しない即興
- 原因: プロンプトが漠然としすぎており、モデルが詳細を補完する余地が大きい
- 解決策:
  - 具体的な視覚的詳細を追加（色、テクスチャ、照明方向）
  - カメラアングルとフレーミングを明示
  - アクションをビート単位で分解

### 6.2 問題: 一貫性の欠如（キャラクターや色の変化）
- 原因: クリップの長さが長すぎる、または視覚的アンカーが不足
- 解決策:
  - 8〜10秒以内に収める（理想は4〜8秒）
  - 視覚的アンカー（「青いバックパック」「赤いコート」）を繰り返し言及
  - 画像入力（リファレンス画像）を使用してキャラクターデザインを固定

### 6.3 問題: モーションがぎこちない
- 原因: 複雑すぎるアクション、物理的に不自然な動き、時間的なビートの欠如
- 解決策:
  - 1ショットに1つの明確なアクション
  - 動作をカウント可能なステップに分解（「4歩歩く」「3回ペダルを漕ぐ」）
  - 現実的な物理を記述（「リアルな重量」「一貫した重力」）
  - 失敗が繰り返される場合は、シンプルに戻す：カメラを固定、アクションを簡素化、背景をクリアに。基本が機能したら段階的に複雑さを追加

### 6.4 問題: 対話の音声同期がずれる
- 原因: 対話が長すぎる、またはクリップの長さに対して不適切
- 解決策:
  - 対話を別ブロックに記述
  - 4秒クリップ：1〜2回の短い交換
  - 8秒クリップ：もう少し長い交換
  - トーン、アクセント、正確なセリフを含める
  - 話者を一貫してラベル付け

### 6.5 問題: オブジェクトやキャラクターが欠落
- 原因: プロンプトに多数のオブジェクトを列挙し、焦点が分散
- 解決策:
  - 主要な被写体に焦点を絞る
  - 環境は簡潔に記述（「居心地の良いキッチン」「雑然としたワークショップ」）
  - 重要な要素のみ具体的に言及

## 7. ベストプラクティスまとめ

1. **撮影監督に指示するように書く**: ストーリーボードを描くように、カメラフレーミング、被写界深度、アクションのビート、照明、パレットを記述
2. **短く簡潔なショットを優先**: 4〜8秒が理想。長いシーンは複数クリップを編集で繋ぐ
3. **1ショット1動作の原則**: 1つの明確なカメラ動作と1つの明確な被写体アクションに絞る
4. **スタイルを早期に確立**: 「1970年代のフィルム」「16mmモノクロ」など視覚的な美学を冒頭で指定
5. **カラーパレットで安定性確保**: 3〜5色を指定してショット間の一貫性を維持
6. **時間的ビートで動作を分解**: 「4歩歩く、一時停止、カーテンを引く」のようにアクションをカウント可能なステップに
7. **画像入力で制御を強化**: リファレンス画像でキャラクターデザイン、衣装、構図を固定
8. **対話は別ブロック**: 視覚的記述と対話を明確に分離し、簡潔に保つ
9. **否定をプロンプト内に組み込む**: 「レンズフレアなし」「画面上のテキストなし」「ダッチアングル回避」
10. **反復と小さな変更**: 失敗時は一度に1つの要素を変更。「同じショット、85mmレンズに切り替え」のように明示

---

**更新日**: 2025-11-04
**対象モデル**: OpenAI Sora 2
**参照ソース**:
- OpenAI Cookbook - Sora 2 Prompting Guide (https://cookbook.openai.com/examples/sora/sora2_prompting_guide)
- GitHub Gist - Crafting Cinematic Sora Video Prompts
- 複数のコミュニティベストプラクティスガイド（2025年）
