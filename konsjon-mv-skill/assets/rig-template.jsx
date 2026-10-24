/**
 * rig-template.jsx —— 像素角色骨架模板
 *
 * 规格：10 格宽 × 20 格高 ／ viewBox 0 0 100 200 ／ CELL = 10
 * 关节：4 个（左右肩、左右髋）
 * 动作：11 种（idle / walk / pocket / pull / throw / trouble / cover / wipe / kick / sit / shy）
 *
 * 用法：复制为 src/characters/heroA.tsx，只改下面标了「可改区」的部分。
 *       关节坐标与 getPose 公式不要动 —— 那是骨架，动了动作会歪。
 *
 * 依赖：只有 react。不许引入任何图片、外部字体、第三方动画库。
 */

import React from "react";

// ═══════════════ 可改区 1 · 网格 ═══════════════
// 10×20 是通用规格，一般不要改。改了要同步 JOINT 与所有部件坐标。
const CELL = 10;

// ═══════════════ 可改区 2 · 配色（换角色只改这里） ═══════════════
// 每个材质 2–3 阶：主色 / 暗部 / 亮部。像素的立体感来自阶数，不是颜色种类。
const PALETTE = {
  hair: "#2b1f33",
  hairHi: "#4a3550",
  hairDk: "#1a1220",

  skin: "#f8d2b0",
  skinDk: "#e6b28c",

  blush: "#f08fa8",
  blushShy: "#ff4f74",
  eye: "#1a1420",
  mouth: "#c0553a",
  mouthShy: "#e0607a",

  top: "#f5819f",
  topHi: "#ffabc4",
  topDk: "#d95a7c",

  bottom: "#333d5e",
  bottomDk: "#252c46",

  shoe: "#f2eaf0",
  shoeHi: "#ffffff",
};

// ═══════════════ 固定区 · 渲染器 ═══════════════
// 所有部件坐标都用「格」为单位，这里统一乘 CELL。
const R = ({ x, y, w = 1, h = 1, fill }) => (
  <rect x={x * CELL} y={y * CELL} width={w * CELL} height={h * CELL} fill={fill} />
);

// ═══════════════ 可改区 3 · 部件表 ═══════════════
// 五官位置：眼睛 x=3 / x=6 (y=3)，腮红 x=3 / x=6 (y=4)，嘴 x=4 w=2 (y=5)
// ⚠️ 加眼镜/刘海/帽子时，必须检查有没有压住眼睛和嘴那两格。

const buildHead = (shy) => [
  // 头顶 + 刘海
  { x: 3, y: 0, w: 4, h: 1, fill: PALETTE.hair },
  { x: 4, y: 0, w: 1, h: 1, fill: PALETTE.hairHi },
  { x: 2, y: 1, w: 6, h: 1, fill: PALETTE.hair },
  { x: 2, y: 1, w: 2, h: 1, fill: PALETTE.hairHi },
  { x: 2, y: 2, w: 6, h: 1, fill: PALETTE.hair },
  // 两侧长发
  { x: 2, y: 3, w: 1, h: 3, fill: PALETTE.hair },
  { x: 7, y: 3, w: 1, h: 3, fill: PALETTE.hair },
  // 马尾（不想要马尾就删这两行）
  { x: 8, y: 2, w: 1, h: 5, fill: PALETTE.hair },
  { x: 8, y: 2, w: 1, h: 2, fill: PALETTE.hairHi },
  // 脸
  { x: 3, y: 3, w: 4, h: 1, fill: PALETTE.skin },
  { x: 3, y: 4, w: 4, h: 1, fill: PALETTE.skin },
  { x: 3, y: 5, w: 4, h: 1, fill: PALETTE.skin },
  // 眼睛（shy = 闭眼横线）
  ...(shy
    ? [
        { x: 3, y: 3, w: 1, h: 1, fill: "#3a2630" },
        { x: 6, y: 3, w: 1, h: 1, fill: "#3a2630" },
      ]
    : [
        { x: 3, y: 3, w: 1, h: 1, fill: PALETTE.eye },
        { x: 6, y: 3, w: 1, h: 1, fill: PALETTE.eye },
      ]),
  // 腮红
  { x: 3, y: 4, w: 1, h: 1, fill: shy ? PALETTE.blushShy : PALETTE.blush },
  { x: 6, y: 4, w: 1, h: 1, fill: shy ? PALETTE.blushShy : PALETTE.blush },
  // 嘴
  { x: 4, y: 5, w: 2, h: 1, fill: shy ? PALETTE.mouthShy : PALETTE.mouth },
];

// 背面：整片头发垂到肩，无五官
const buildHeadBack = () => [
  { x: 3, y: 0, w: 4, h: 1, fill: PALETTE.hair },
  { x: 4, y: 0, w: 1, h: 1, fill: PALETTE.hairHi },
  { x: 2, y: 1, w: 6, h: 1, fill: PALETTE.hair },
  { x: 3, y: 1, w: 2, h: 1, fill: PALETTE.hairHi },
  { x: 2, y: 2, w: 6, h: 1, fill: PALETTE.hair },
  { x: 2, y: 3, w: 6, h: 1, fill: PALETTE.hair },
  { x: 2, y: 4, w: 6, h: 1, fill: PALETTE.hair },
  { x: 2, y: 5, w: 6, h: 1, fill: PALETTE.hair },
  { x: 2, y: 6, w: 6, h: 1, fill: PALETTE.hair },
  { x: 8, y: 2, w: 1, h: 6, fill: PALETTE.hair },
  { x: 8, y: 2, w: 1, h: 2, fill: PALETTE.hairHi },
];

const TORSO = [
  { x: 3, y: 6, w: 4, h: 1, fill: PALETTE.top },
  { x: 2, y: 7, w: 6, h: 5, fill: PALETTE.top },
  { x: 2, y: 7, w: 1, h: 5, fill: PALETTE.topDk },
  { x: 7, y: 7, w: 1, h: 5, fill: PALETTE.topDk },
  { x: 3, y: 7, w: 1, h: 3, fill: PALETTE.topHi },
  { x: 3, y: 12, w: 4, h: 1, fill: PALETTE.bottom },
];

const ARM_L = [{ x: 0, y: 7, w: 2, h: 5, fill: PALETTE.top }];
const HAND_L = [{ x: 0, y: 11, w: 2, h: 1, fill: PALETTE.skin }];
const ARM_R = [{ x: 8, y: 7, w: 2, h: 5, fill: PALETTE.top }];
const HAND_R = [{ x: 8, y: 11, w: 2, h: 1, fill: PALETTE.skin }];

const LEG_L = [
  { x: 3, y: 13, w: 2, h: 5, fill: PALETTE.bottom },
  { x: 4, y: 13, w: 1, h: 5, fill: PALETTE.bottomDk },
  { x: 3, y: 18, w: 2, h: 1, fill: PALETTE.shoe },
  { x: 3, y: 18, w: 1, h: 1, fill: PALETTE.shoeHi },
];
const LEG_R = [
  { x: 5, y: 13, w: 2, h: 5, fill: PALETTE.bottom },
  { x: 5, y: 13, w: 1, h: 5, fill: PALETTE.bottomDk },
  { x: 5, y: 18, w: 2, h: 1, fill: PALETTE.shoe },
  { x: 5, y: 18, w: 1, h: 1, fill: PALETTE.shoeHi },
];

// 坐姿腿：不参与旋转，整块替换
const SIT_LEGS = [
  { x: 2, y: 14, w: 6, h: 2, fill: PALETTE.bottom },
  { x: 2, y: 13, w: 1, h: 1, fill: PALETTE.bottomDk },
  { x: 7, y: 13, w: 1, h: 1, fill: PALETTE.bottomDk },
  { x: 2, y: 16, w: 3, h: 1, fill: PALETTE.shoe },
  { x: 5, y: 16, w: 3, h: 1, fill: PALETTE.shoeHi },
];

// ═══════════════ 固定区 · 关节（不要轻易改） ═══════════════
const JOINT = {
  armL: { x: 1 * CELL, y: 7 * CELL },
  armR: { x: 9 * CELL, y: 7 * CELL },
  legL: { x: 4 * CELL, y: 13 * CELL },
  legR: { x: 6 * CELL, y: 13 * CELL },
};

// ═══════════════ 固定区 · 动作库（11 种） ═══════════════
// 全部用 sin 驱动 → 任意帧都有连续角度，不需要画第二张图。
// 加新动作：照抄一个分支，改角度即可。
function getPose(action, mood, frame) {
  const pose = { armL: 0, armR: 0, legL: 0, legR: 0, bobY: 0 };
  const wave = (n) => Math.sin((frame / n) * Math.PI * 2);

  if (action === "walk") {
    const p = wave(16);
    pose.armL = p * 30;
    pose.armR = -p * 30;
    pose.legL = -p * 24;
    pose.legR = p * 24;
    pose.bobY = -Math.abs(p) * 1.5;
  } else if (action === "pocket") {
    const p = wave(20);
    pose.armL = -5 + p * 3;
    pose.armR = 5 - p * 3;
    pose.legL = -p * 28;
    pose.legR = p * 28;
    pose.bobY = -Math.abs(p) * 1.8;
  } else if (action === "pull") {
    const p = wave(18);
    pose.armL = 10 + p * 5;
    pose.armR = -30 + p * 3;
    pose.legL = -p * 20;
    pose.legR = p * 20;
    pose.bobY = -Math.abs(p) * 1.2;
  } else if (action === "throw") {
    const b = wave(10);
    pose.armR = 146 + b * 3;
    pose.armL = -12 - b * 2;
    pose.legL = -7;
    pose.legR = 7;
    pose.bobY = -1.5;
  } else if (action === "trouble") {
    const b = wave(15);
    pose.armR = 168 + b * 1.5;
    pose.armL = 10 + b * 2;
    pose.bobY = 2 + Math.abs(b) * 0.5;
  } else if (action === "cover") {
    const b = wave(9);
    pose.armL = 172 + b * 3;
    pose.armR = -172 - b * 3;
    pose.legL = -5;
    pose.legR = 5;
    pose.bobY = 2.5 + Math.abs(b) * 0.6;
  } else if (action === "wipe") {
    const b = wave(8);
    pose.armL = 166 + b * 8;
    pose.armR = -8;
    pose.bobY = 0.8;
  } else if (action === "kick") {
    pose.legR = -72;
    pose.legL = 14;
    pose.armL = 34;
    pose.armR = 28;
    pose.bobY = -4;
  } else if (action === "sit") {
    const b = wave(24);
    pose.legL = -84;
    pose.legR = -84;
    pose.armL = -14 + b * 1.2;
    pose.armR = 14 - b * 1.2;
    pose.bobY = 7 + b * 0.4;
  } else if (mood === "shy") {
    const b = wave(20);
    pose.armL = -8 + b * 2;
    pose.armR = 8 - b * 2;
    pose.bobY = 1.2 + Math.abs(b) * 0.5;
  } else {
    // idle
    const b = wave(19);
    pose.armL = b * 3.5;
    pose.armR = -b * 3.5;
    pose.bobY = -Math.abs(b) * 0.4;
  }
  return pose;
}

const rot = (deg, j) => `rotate(${deg.toFixed(2)} ${j.x} ${j.y})`;

// ═══════════════ 组件 ═══════════════
export const Hero = ({
  action = "idle",
  mood = "normal",
  frame = 0,
  height = 324,          // 占画面高 30%（1080p），调用方按需传
  facing = "front",
}) => {
  const pose = getPose(action, mood, frame);
  const head = facing === "back" ? buildHeadBack() : buildHead(mood === "shy");
  const width = (height * 100) / 200;   // 保持 10:20

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 200"
      style={{
        imageRendering: "pixelated",
        overflow: "visible",
        transform: `translateY(${Math.round(pose.bobY * (height / 200))}px)`,
      }}
    >
      {/* 手臂在躯干后面 */}
      <g transform={rot(pose.armL, JOINT.armL)}>
        {ARM_L.map((c, i) => <R key={`al${i}`} {...c} />)}
        {HAND_L.map((c, i) => <R key={`lh${i}`} {...c} />)}
      </g>
      <g transform={rot(pose.armR, JOINT.armR)}>
        {ARM_R.map((c, i) => <R key={`ar${i}`} {...c} />)}
        {HAND_R.map((c, i) => <R key={`rh${i}`} {...c} />)}
      </g>

      {/* 腿 */}
      {action === "sit" ? (
        SIT_LEGS.map((c, i) => <R key={`sl${i}`} {...c} />)
      ) : (
        <>
          <g transform={rot(pose.legL, JOINT.legL)}>
            {LEG_L.map((c, i) => <R key={`ll${i}`} {...c} />)}
          </g>
          <g transform={rot(pose.legR, JOINT.legR)}>
            {LEG_R.map((c, i) => <R key={`lr${i}`} {...c} />)}
          </g>
        </>
      )}

      {TORSO.map((c, i) => <R key={`t${i}`} {...c} />)}
      {head.map((c, i) => <R key={`h${i}`} {...c} />)}
    </svg>
  );
};

export default Hero;

/**
 * ─── 自检清单（改完必看）───
 * [ ] PALETTE 里每个材质至少 2 阶（主色 + 暗部），主角至少 3 阶
 * [ ] 眼睛在 x=3 / x=6，嘴在 x=4 w=2 —— 被新部件压住了吗？
 * [ ] 所有坐标是整数格，没有 2.5 这种值
 * [ ] height 是按画面百分比算出来的，不是写死 216
 * [ ] 场景文件里没有任何主角颜色字面量
 * ─────────────────────────
 */
