# 代码铁律

## 1. 画质与性能（单档锁死 1080p）

**分辨率恒定 `1920×1080`。代码里不许出现宽高变量、不许 `scale` 包装、不许做第二档分辨率。**
原因：像素坐标是绝对的，换分辨率会让道具位置与像素网格同时崩掉。

性能差异只从一个开关走，**且只影响四件事**：

```ts
export const PERF = {
  high: { particleMax: 220, parallaxLayers: 5, domMax: 600, concurrency: 8 },
  low:  { particleMax: 60,  parallaxLayers: 3, domMax: 300, concurrency: 4 },
};
```

**OOM 三道防线（不要靠"观察内存"，那是不可执行的）**

1. **静态节点预算**（渲前算）：单场景 `<rect>` 预估 > 600 → 自动降到 `low`；> 900 → 必须先优化（合并小件 / 改 `<pattern>`）再渲。
2. **并发降级阶梯**：`8 → 4 → 2`。1080p 大场景下 8 并发是最常见的 OOM 来源，降到 4 通常就够。
3. **测速探针**：渲 10 帧时若进程被杀、或单帧耗时突然 > 5s，就是资源告警，先降密度再继续。

---

## 2. 唯一配置源（分层，不是全塞一处）

```ts
// src/config.ts —— 全局真源
export type Perf = "high" | "low";

export const CONFIG = {
  fps: 30,                       // 恒定，不随任何档位变化
  perf: "high" as Perf,
  audioFromSec: 62.38,           // 从原曲第几秒起截（秒）
  sampleEndFrame: 450,           // 样品结束帧 = 第二个歌词行的 end，不是固定值
  lead: 4,                       // 字幕提前帧数（标定方法见 audio-sync.md）
  watermark: { on: true, text: "@konsJon" },
  heroes: [] as { id: string; name: string; file: string; heightPct: number }[],
  //      ↑ Step 4 定稿后填，例 { id:"A", name:"女主", file:"src/characters/heroA.tsx", heightPct: 30 }
  mode: "A" as "A" | "B",        // A 直译 / B 故事
  lyricMode: "perChar" as "instant" | "perChar",
  hot: true,                     // 关键词是否高亮（与 lyricMode 正交）
  lyricFx: "dialog",
  palette: "scene_city",         // 只能选 palettes.json 里的 scene_*
};
```

**分层规则**：

- **跨段复用**的值 → 必须进 `CONFIG`
- **单段内部**的值（本段切点帧、本段色板、本段坐标表）→ 允许在段文件**顶部集中声明**，禁止散落在 JSX 里
- 同一语义的值**只许有一个真源**，不许第二处副本（包括不许把 config 抄进文档）

---

## 3. 像素字体（跳过必糊）

字体随 skill 附带：`assets/fonts/Zpix.ttf`（6.9MB）。复制到项目 `public/Zpix.ttf`，**不要联网下载**。

**只用原生 API，不装 `@remotion/fonts`**（它不在默认依赖里，会卡在第一步）：

```ts
const handle = delayRender("load Zpix");
new FontFace("Zpix", `url(${staticFile("Zpix.ttf")}) format("truetype")`)
  .load()
  .then((f) => { document.fonts.add(f); continueRender(handle); })
  .catch(() => continueRender(handle));   // 失败也必须 continue，否则永久卡死
```

```ts
export const PIXEL_FONT = "'Zpix', monospace";   // 全局唯一常量，禁止各处写字体名
```

---

## 4. 音频与时间轴

```tsx
const { durationInFrames } = useVideoConfig();
const startFrom = Math.round(CONFIG.audioFromSec * CONFIG.fps);   // 单位是「帧」

<Audio src={staticFile("song.mp3")} startFrom={startFrom} endAt={startFrom + durationInFrames} />
```

逐字换算：`绝对帧 = Math.round((lrc秒 - CONFIG.audioFromSec) * CONFIG.fps)`

### 4.1 LRC 三个必踩的坑

1. **编码**：网上下的 LRC 十有八九是 **GBK**，直接读是乱码。必须先探编码，非 UTF-8 就转码。
2. **格式变体**（三种都要能解）：
   ```
   [00:12.34]标准
   [00:12:340]冒号代替点
   [00:12.34][01:20.11]一行多时间戳（副歌重复）→ 拆成两行，别丢别重复
   ```
3. **空行/间奏行**：`[00:45.00]` 后面没文本 → 必须跳过，否则会切出一个空场景（黑屏两秒）。

### 4.2 确定 `audioFromSec`（不要问"偏移多少"，用户答不出）

问 **"你这个片段第一句唱的是什么词"**，然后反查 LRC：

| 用户回答 | 动作 |
|---|---|
| 说出某句歌词 | LRC 里查该句时间戳 → `audioFromSec = 该值` |
| "LRC 是给片段做的，从 0 起" | `audioFromSec = 0`，**不要减任何值** |
| "不知道，随便剪的" | 让用户试听报"第几秒听到第一句"，或用音频互相关对齐 |

### 4.3 三道校验（缺一道就会错位）

1. **算完立即断言**：第一句的绝对帧应 ≤ 2 秒（60 帧）。超了就是 offset 算错，停下来问，不许硬渲。
2. **残缺行标记**：片段起点落在某句中间 → 该句标记为残缺，不显示或只显示后半句。
3. **渲染后互相关复核**：音轨与源音频 lag 应接近 0ms（方法见 `audio-sync.md`）。

---

## 5. 画布与抗锯齿

- 场景用 `<svg viewBox="0 0 480 270" style={{ width: "100%", imageRendering: "pixelated" }}>`
- 角色用 `<svg viewBox="0 0 100 200" style={{ imageRendering: "pixelated" }}>`
- **禁止 `shapeRendering="crispEdges"`**：会毁掉文字渲染和 polygon 斜边。像素感靠"小逻辑坐标系 + viewBox 放大 + `imageRendering: pixelated`"实现。
- 所有坐标、`Math.sin` 位移包 `Math.round()` 取整。

---

## 6. 全局帧 vs 段内局部帧（错位第一大原因）

| 层 | 用哪个帧 |
|---|---|
| UI 壳、字幕、水印、跨段转场 | **全片绝对帧** |
| 场景内部元素（人物动作、粒子、段内遮罩） | **段内局部帧**（`Sequence` 内 `useCurrentFrame()` 从 0 起） |

- 落在场景 `<Sequence>` 之外的东西，一律用全局帧。
- 字幕、HUD、水印**绝对不能放进场景 `Sequence` 内**：否则逐字算法的 `- lead` 会被起点裁掉，开场固定丢帧。
- 段内若需要全局帧，必须显式 `props` 传入，不许在段内重算。

**`Sequence` 累加校验**：各段 `durationInFrames` 之和必须等于总长。少一个数就会出现重叠或空档（表现为某处黑一帧，极难定位）。

---

## 7. 图层与 z-index（含层叠上下文陷阱）

```
场景层          1 – 10
段内遮罩        500 – 520（挂在场景内部）
跨段转场        500
UI 容器         9999（独立 div）
  ├ GameUI      990 – 999
  └ 水印        999
```

**关键机制**：UI 容器必须是场景与转场的**兄弟节点**，不能是祖先或后代。
父级一旦有 `transform` / `opacity < 1` / `filter`，就会生成新的层叠上下文，`z-index: 9999` 会被困在里面，跟着镜头一起缩放——这是最隐蔽的翻车点。

---

## 8. 确定性随机（防逐帧闪烁）

禁止 `Math.random()`：

```ts
const rand = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
```

雨滴、星点、窗户亮灭、灯光闪烁全部走它。

---

## 9. 防代码截断（大模型会写到一半省略）

1. **一次只写一个文件**，写完落盘再写下一个。中途截断也只损失当前文件。
2. **代码里禁止出现 `...` / `省略` / `TODO` / `此处同上` / `其余类似`**。写不完就停手报告，不许假装写完。
3. 单文件 **≤ 300 行**（角色骨架可放宽到 400），超了就拆场景文件。
4. 主文件只做 `Composition` 注册与 `<Sequence>` 拼装，不写具体场景。

---

## 10. 路径必须全 ASCII

- **项目根目录**不许含中文、空格、单引号（ffmpeg / Chromium 在中文路径下行为不一致，最难排查）。
- 归位素材统一改名 `song.mp3` / `song.lrc`。
- 复制时路径一律加引号（防空格与 `'`）。

---

## 11. 渲染配置

```ts
Config.setVideoImageFormat("jpeg");
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);
```

> ⚠️ **实测提醒**：附带的两个参考成片（`refs-initial/videos/`）现在都是 **`yuvj420p`（full range）**，说明上面这行 `setPixelFormat("yuv420p")` 在实拍里**没有真正生效**。
> 渲染完成后必须用 `ffprobe` 核一次实际的 `pix_fmt`；若仍是 `yuvj420p`，用 ffmpeg 转一遍：
> ```bash
> ffmpeg -i out.mp4 -c:v libx264 -pix_fmt yuv420p -c:a copy out-fix.mp4
> ```
> 不转的话，部分播放器/内嵌预览会打不开或偏色。

```bash
npx remotion render <ID> out.mp4 --concurrency=<PERF.concurrency>
npx remotion render <ID> out/t.mp4 --frames=0-450        # 样品/局部验证
```

---

## 12. 禁止外部资源（硬红线）

1. **禁止网络资源**：不许 `<Img src="https://...">`、`fetch`、远程字体。远程图会让 `delayRender` 一直等，结果不是超时就是黑屏。
2. **禁止 `<Img>` 加载位图**：所有画面用 `<rect>` / `<polygon>` / `<path>` 拼；画不出来就用 `props.md` 基础件组合。
3. **禁止擅自装依赖**：除 `remotion` 外不新增包。
4. **禁止 `filter` 系列**：`blur()` / `drop-shadow()` / `backdrop-filter` / `saturate()`。它们是渲染最贵的操作，且破坏像素硬边。
5. **`box-shadow` 有条件允许**：纯色、零模糊、偏移 ≥ 2px，单元素叠层 **≤ 3 层**。
6. **`radial-gradient` 允许且推荐**：太阳、灯晕、月晕用它（1 个节点，成本可忽略）。大面积柔和光晕优先用它。

---

## 13. 参考视频抽帧

```bash
ffmpeg -i ref.mp4 -vf scale=720:-2 -r 1 frame_%03d.png
```

`ffmpeg` 不在 PATH 时依次退：

1. `npx remotion ffmpeg -i ref.mp4 -vf scale=720:-2 -r 1 frame_%03d.png`
2. `node_modules/@remotion/compositor-*/ffmpeg.exe`

抽帧后**必须逐张实际查看**，不许凭文件名猜。抽帧目的是提取"景别 / 运镜 / 转场 / 字幕位置 / 色彩"，不是只看"像素风"。
