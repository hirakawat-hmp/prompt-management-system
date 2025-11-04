# 動画生成プロンプトTips - Google Veo 3

> このドキュメントはGoogle Veo 3における効果的なプロンプト作成テクニックをまとめたものです。
> LLMがプロンプト生成・改善時に参照することを想定しています。

## 1. プロンプト構造の基本

### 1.1 必須要素
- **主題（Subject）**: 動画の中心となる人物、物体、動物、風景を明確に記述する。具体的な外見、服装、特徴を含める。
- **アクション/モーション（Action/Motion）**: 主題が何をしているかを明確に記述。単純な動き（歩く）から複雑な動き（立ち止まって反応する）まで、レイヤー化された記述が可能。
- **スタイル（Style）**: 動画全体の見た目と雰囲気。映画ジャンル（horror film、film noir）、ビジュアルトーン（cinematic、cartoon render）、アート的美学（pixel style 3D、stop-motion）などを指定。
- **品質修飾語（Quality modifiers）**: "cinematic lighting"、"shallow depth of field"、"4K"、"highly detailed"など、出力品質を向上させる記述語。

### 1.2 推奨要素
- **カメラワーク（Camera movement）**: カメラの動き（static、tracking、dolly-in、aerial view、slow pan）を明示的に指定。指定しない場合、Veo 3はデフォルトのフレーミングを選択する。
- **構図（Composition）**: ショットのフレーミング（wide shot、close-up、extreme close-up、low angle、two-shot、medium shot）を明確に記述。
- **照明（Lighting）**: 光の質と方向（soft daylight、neon glow、backlight with warm rim、moody shadows、golden hour lighting）。
- **時間軸の流れ（Temporal flow）**: シーンの展開順序や変化のタイミング。複雑なシーンでは詳細なプレイバイプレイのマッピングが有効。
- **その他**:
  - **コンテクスト（Context）**: 背景、設定、環境、時間帯
  - **アンビアンス（Ambiance）**: カラーパレット（warm tones、cool blue、neon colors）
  - **オーディオ（Audio）**: 音響効果、環境音、台詞（別文で記述推奨）

### 1.3 要素の推奨順序
```
[Cinematography/Camera] + [Subject] + [Action] + [Context] + [Style & Ambiance] + [Audio]

例:
Close-up with shallow depth of field, a young woman's face, looking out a bus window at passing city lights with her reflection faintly visible on the glass, inside a bus at night during a rainstorm, melancholic mood with cool blue tones, moody cinematic. SFX: rain pattering on glass, distant traffic sounds.
```

## 2. 効果的な記述テクニック

### 2.1 モーションの記述
- **具体的な動詞を使用**: "running" より "sprinting through narrow alleyways" の方が効果的
- **モーションのレイヤー化**: 主題の動きとカメラの動きを分離して記述
- **物理的に自然な動き**: 重力、慣性、現実的な速度を考慮した動き
- 例:
  - ✅ Good: "The pianist's hands move precisely across the keys, fingers dancing with controlled intensity"
  - ❌ Bad: "Hands move on piano"

### 2.2 カメラワークの指定
- **カメラ移動は必ず明示**: 指定しない場合、Veo 3はトレーニングで最も一般的だったフレーミングパターンをデフォルト選択する
- **独立した文で記述**: "The camera pulls back to reveal..." のように、カメラの動きは単独の文として記述すると解析されやすい
- パターン:
  - **Static**: "Static shot on tripod, no camera movement"
  - **Dolly**: "Slow dolly-in on weathered face building intimacy"
  - **Tracking**: "Smooth tracking shot following character at walking speed, gimbal stabilized"
  - **Crane**: "Crane shot ascending from ground level to reveal vast canyon"
  - **Aerial**: "Aerial view descending from clouds towards coastal city"
  - **POV**: "POV shot from motorcycle rider's perspective, racing through neon-lit streets"
  - **Pan/Tilt**: "Slow horizontal pan across mountain range at sunset"

### 2.3 時間軸の制御
- **シーケンシャルな記述**: 開始、中間、終了を明確に区別した記述
- **時間ベースのワークフロー**: タイムスタンプ記述（[00:00-00:02]など）は非公式だが一部で有効
- **マルチショットアプローチ**: 複雑なシーンは複数プロンプトに分割し、first/last frameワークフローで繋ぐ
- 注意点: 8秒のクリップ生成を前提に、その時間内で完結する動きを記述する

### 2.4 重み付け・強調
- **繰り返しと詳細化**: 重要な要素は複数の形容詞や副詞で強調（例: "massive, rusted cargo ship" > "big boat"）
- **強い形容詞の使用**: "fractured shard of moonlit ice" > "piece of ice"
- **配置による強調**: プロンプトの最初に記述した要素が優先される傾向
- 構文: Veo 3には重み付け用の特殊構文（例: `(keyword:1.5)`）は公式にサポートされていない

### 2.5 否定表現の扱い
- **ネガティブプロンプトの使用**: 望まない要素を除外できる
- **記述的に除外**: "no"や"don't"などの指示的言語は避け、除外したい要素を直接記述
- 注意点:
  - ❌ Bad: "no walls or frames"
  - ✅ Good: ネガティブプロンプトに "wall, frame" と記述（または除外したい要素を記述）
  - ❌ Bad: "don't show dark weather"
  - ✅ Good: ネガティブプロンプトに "dark stormy atmosphere" と記述

### 2.6 長さの最適化
- 推奨文字数/単語数: **100-150語（約3-6文）** または **10-25語（シンプルなショット）** / **120-180語（カバレッジショット）**
- 理由:
  - 長すぎるプロンプト（50語以上）はモデルを混乱させ、矛盾した結果を生む
  - 短すぎると曖昧になり、意図しない結果になる
  - バランスと明確性が重要：1ショットにつき1つの明確なアイデア

ベストプラクティス:
- 核となるコンセプトに集中し、余分な詳細は除外
- 「very」などの修飾語を避け、より正確な同義語を使用（例: "very big" → "gigantic"）
- 簡潔でも記述的な言語を使用

## 3. 避けるべきパターン

### 3.1 曖昧な表現
- ❌ 悪い例: "A person walks in a place"
- ✅ 良い例: "An elderly man in a worn leather jacket walks slowly through a misty forest trail at dawn"
- 理由: 具体性の欠如はランダムなフレーミングや意図しないムードを生む。AIは推測ではなく明確な指示を必要とする。

### 3.2 過度な詳細
- **50語を超える単一プロンプト**: 要素が多すぎると矛盾や不整合が発生
- **複数のアクションの詰め込み**: 1ショットに複数の複雑な動きを入れると、どれも中途半端になる
- **推奨**: フォーカスを絞り、必要なら複数のショットに分割

### 3.3 矛盾する指示
- 矛盾が発生しやすいパターン:
  - カメラとサブジェクトの動きが逆方向（"camera zooms in while subject moves away"）
  - 光源と照明効果の矛盾（"bright daylight with neon glow"）
  - オーディオとビジュアルのミスマッチ（"birdsong ambient" + "city street scene"）
- **解決策**: 各要素が論理的に整合していることを確認

### 3.4 不自然なモーション
- 物理的に不可能な動き（急激な重力無視、瞬間移動的な速度変化）
- 人体の構造を無視した動き
- **推奨**: 現実的な物理法則と人間の動きに基づいた記述

## 4. モデル固有の構文・機能

### 4.1 特殊構文
- **台詞フォーマット**:
  - `Character says: "exact words"` 形式を使用
  - クォーテーションマークを使った台詞は可能だが、`(no subtitles)` を追加して不要な字幕を防ぐ
  - 例: `A woman says, "We have to leave now." (no subtitles)`
- **カメラ位置のトリガー**:
  - `(that's where the camera is)` フレーズをカメラ位置指定に追加すると、カメラ認識処理がトリガーされる
  - 例: "Eye-level shot (that's where the camera is), tracking the subject"
- **オーディオ記述**:
  - `SFX:` プレフィックスで効果音を指定（例: `SFX: thunder cracks in the distance`）
  - `Ambient noise:` プレフィックスで環境音を指定（例: `Ambient noise: quiet hum of starship bridge`）

### 4.2 パラメータ
- **ネガティブプロンプト**: プロンプトとは別に、除外したい要素を記述する専用フィールド
- **オーディオ生成**: `veo-3.0-generate-001` モデル（Preview）でサポート。明示的に指定する必要がある

### 4.3 動画特有の設定
- 長さ（Duration）: 8秒が標準。台詞は8秒以内で読める長さ（約20語以内）に制限
- アスペクト比:
  - **16:9（ワイドスクリーン）**: 風景や背景が重要なシーンに最適
  - **9:16（ポートレート）**: 縦長の被写体（滝、建物、人物）に最適
- フレームレート: 公式ドキュメントでは明示されていないが、生成後の設定は調整可能

## 5. プロンプト例

### 5.1 基本例
```
A golden retriever puppy runs through a sunlit meadow filled with wildflowers, ears flapping in the breeze. The camera tracks alongside at ground level. Bright afternoon sunlight, cheerful mood. SFX: gentle wind, distant birds chirping.
```

### 5.2 高度な例
```
Close-up with shallow depth of field on an old sailor, his knitted blue sailor hat casting a shadow over his weathered eyes, a thick grey beard obscuring his chin. He holds his pipe in one hand, gesturing with it towards the churning, grey sea beyond the ship's railing. The camera slowly dollies in as his expression shifts from contemplation to determination. Overcast lighting, cool grey tones, cinematic mood. SFX: crashing waves, creaking ship timbers, distant seagull cries.
```

### 5.3 スタイル別例
- **写実的**:
  ```
  Medium shot of a young woman in a red coat walking through a snowy Central Park at dusk. Soft bokeh from street lamps creates warm halos in the background. Slow tracking shot follows her from the side. Realistic style, shallow depth of field, golden hour lighting transitioning to blue hour. SFX: crunching snow underfoot, distant city traffic.
  ```
- **アニメーション**:
  ```
  A cartoon cat in Pixar 3D animation style chases a butterfly through a vibrant garden. Exaggerated bouncy movements, bright saturated colors, soft ambient lighting. Wide shot, static camera. Cheerful upbeat mood. SFX: playful music, light footsteps, butterfly fluttering.
  ```
- **抽象的**:
  ```
  Flowing liquid metal morphs from geometric cubes into organic floral shapes. Abstract digital art style, iridescent chrome surfaces reflecting rainbow light. Slow rotating camera movement. Dark background, dramatic rim lighting. Electronic ambient soundscape.
  ```
- **その他（ストップモーション）**:
  ```
  Stop-motion animation of a felt puppet astronaut planting a flag on a miniature cardboard moon surface. Claymation style, visible texture and handcrafted details. Static overhead shot. Warm practical lighting with visible shadows. SFX: muffled fabric movements, gentle thud of flag planting.
  ```

### 5.4 カメラワーク別例
- **静止カメラ**:
  ```
  Static tripod shot, eye-level. A barista carefully pours latte art in a ceramic cup at a wooden counter. Morning sunlight streams through a window creating soft shadows. Cozy coffee shop atmosphere, warm tones. SFX: espresso machine hissing, gentle ceramic clinks.
  ```
- **パン/ティルト**:
  ```
  Slow horizontal pan across a mountain range at golden hour. Starting from shadowed valleys on the left, moving right to reveal snow-capped peaks illuminated by the setting sun. Wide establishing shot, epic landscape photography style. SFX: gentle mountain wind.
  ```
- **ズーム**:
  ```
  Slow zoom-in on a chess board during an intense match. Starting wide showing both players, ending extreme close-up on a single knight piece being moved. Dramatic lighting from above, noir style with high contrast shadows. SFX: ticking clock, piece sliding on board.
  ```
- **トラッキング**:
  ```
  Smooth gimbal tracking shot at walking speed, parallel to a cyclist riding through autumn forest path. Full-body profile view, subject in middle third of frame. Motion parallax with blurred foreground leaves. Warm golden afternoon light filtering through trees. SFX: bicycle chain whirring, leaves rustling.
  ```

## 6. よくある問題と解決策

### 6.1 問題: 曖昧すぎる結果（ランダムなフレーミングやムード）
- 原因: プロンプトが非特定的で、Veoが推測に頼ってしまう
- 解決策:
  - 主題、アクション、スタイル、カメラワークを明確に指定
  - 形容詞と副詞を使って詳細な絵を描く
  - "a person walks" ではなく "an elderly man in worn leather jacket walks slowly"

### 6.2 問題: 不要な字幕が表示される
- 原因: Veo 3は字幕入り動画で訓練されており、台詞を含むと字幕を生成する傾向がある
- 解決策:
  - プロンプトに `(no subtitles)` を追加
  - 台詞フォーマットをコロン形式に変更（`Character says: "words"` の代わりに `Character says, words`）

### 6.3 問題: モーションがぎこちない
- 原因:
  - アクションの記述が曖昧
  - 物理的に不自然な動き
  - カメラとサブジェクトの動きが混在
- 解決策:
  - モーションを具体的に記述（"moves quickly" → "sprints with arms pumping"）
  - カメラの動きとサブジェクトの動きを別々の文で記述
  - 現実的な物理法則に従った動きを記述

### 6.4 問題: オーディオとビジュアルがミスマッチ
- 原因: オーディオ記述を省略するか、ビジュアルと論理的に合わないオーディオを指定
- 解決策:
  - オーディオを明示的に指定（指定しないとVeo 3が推測する）
  - ビジュアルシーンに合った音響効果を選択（都市シーンに鳥のさえずりは不適切）
  - SFX、Ambient noise、台詞を別々に記述

### 6.5 問題: 同じプロンプトで似たような結果ばかり
- 原因: Veo 3は同じプロンプトに対して一貫した出力を生成する設計
- 解決策:
  - バリエーションを求める場合は、プロンプトの要素を変更（カメラアングル、照明、スタイル記述語を変える）
  - 同じプロンプトを繰り返すのではなく、異なるアプローチを試す

### 6.6 問題: 要素の過負荷で不整合な結果
- 原因: 単一プロンプトに50語以上の詳細を詰め込みすぎ
- 解決策:
  - フォーカスを絞り、1ショット1アイデアの原則を守る
  - 複雑なシーンは複数のショットに分割
  - シンプルな文構造を使用

## 7. ベストプラクティスまとめ

1. **詳細かつ具体的に記述**: 曖昧な表現を避け、豊富な形容詞と副詞で明確な絵を描く
2. **カメラワークを明示**: カメラの動きを指定しない場合、デフォルトのフレーミングが適用される
3. **オーディオを必ず指定**: ビジュアルに合った音響効果、環境音、台詞を別文で記述
4. **適切な長さを維持**: 100-150語（3-6文）が最適。長すぎても短すぎても効果が低下
5. **ネガティブプロンプトを活用**: 不要な要素を除外し、品質を向上（"no"や"don't"は使わない）
6. **1ショット1アイデア**: フォーカスを絞り、過負荷を避ける
7. **台詞は短く**: 8秒クリップに合わせて20語以内、`(no subtitles)` を追加
8. **物理的に自然な動きを記述**: 現実的な物理法則と人間の動きに従う
9. **反復実験を恐れない**: 同じプロンプトを繰り返すのではなく、異なるアプローチで実験
10. **構造化されたフォーマットを使用**: [Cinematography] + [Subject] + [Action] + [Context] + [Style] + [Audio] の順序を維持

---

**更新日**: 2025-11-04
**対象モデル**: Google Veo 3 / Veo 3.1
**参照ソース**:
- Google DeepMind Official Prompt Guide (deepmind.google/models/veo/prompt-guide/)
- Google Cloud Vertex AI Documentation (cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide)
- Google Cloud Blog - Ultimate Prompting Guide for Veo 3.1 (cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1)
- Community best practices and expert guides (2025)
