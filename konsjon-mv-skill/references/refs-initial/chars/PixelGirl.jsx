import React from "react";

/**
 * PixelGirl —— 纯代码 8-bit 像素女孩（与 PixelBoy 同规格：10 格 × 20 格）
 *
 * 外观：深色长发 + 马尾、粉色上衣、深蓝长裤、白鞋
 *
 * 接口：
 *   action: "idle" | "walk"
 *   mood:   "normal" | "shy"（脸红、低头、闭眼笑）
 *   frame:  当前帧号
 *   height: 渲染高度（px），默认 216
 */

const CELL = 10;

const C = {
  hair: "#2b1f33",
  hairHi: "#4a3550",
  skin: "#f8d2b0",
  skinDk: "#e6b28c",
  blush: "#f08fa8",
  blushShy: "#ff4f74",
  eye: "#1a1420",
  mouth: "#c0553a",
  mouthShy: "#e0607a",
  shirt: "#f5819f",
  shirtDk: "#d95a7c",
  shirtHi: "#ffabc4",
  pants: "#333d5e",
  pantsDk: "#252c46",
  shoe: "#f2eaf0",
  shoeHi: "#ffffff",
};

const R = ({ x, y, w = 1, h = 1, fill }) => (
  <rect
    x={x * CELL}
    y={y * CELL}
    width={w * CELL}
    height={h * CELL}
    fill={fill}
  />
);

// ---------- 部件 ----------

const buildHead = (shy) => [
  // 头顶
  { x: 3, y: 0, w: 4, h: 1, fill: C.hair },
  { x: 4, y: 0, w: 1, h: 1, fill: C.hairHi },
  { x: 2, y: 1, w: 6, h: 1, fill: C.hair },
  { x: 2, y: 1, w: 2, h: 1, fill: C.hairHi },
  { x: 2, y: 2, w: 6, h: 1, fill: C.hair }, // 刘海
  // 两侧长发垂落
  { x: 2, y: 3, w: 1, h: 3, fill: C.hair },
  { x: 7, y: 3, w: 1, h: 3, fill: C.hair },
  // 马尾（右侧）
  { x: 8, y: 2, w: 1, h: 5, fill: C.hair },
  { x: 8, y: 2, w: 1, h: 2, fill: C.hairHi },
  // 脸
  { x: 3, y: 3, w: 4, h: 1, fill: C.skin },
  { x: 3, y: 4, w: 4, h: 1, fill: C.skin },
  { x: 3, y: 5, w: 4, h: 1, fill: C.skin },
  // 眼睛（shy 时闭成横线）
  ...(shy
    ? [
        { x: 3, y: 3, w: 1, h: 1, fill: C.skin },
        { x: 6, y: 3, w: 1, h: 1, fill: C.skin },
        { x: 3, y: 3, w: 1, h: 1, fill: "#3a2630" },
        { x: 6, y: 3, w: 1, h: 1, fill: "#3a2630" },
      ]
    : [
        { x: 3, y: 3, w: 1, h: 1, fill: C.eye },
        { x: 6, y: 3, w: 1, h: 1, fill: C.eye },
      ]),
  // 腮红（shy 时更大更红）
  { x: 3, y: 4, w: 1, h: 1, fill: shy ? C.blushShy : C.blush },
  { x: 6, y: 4, w: 1, h: 1, fill: shy ? C.blushShy : C.blush },
  // 嘴
  { x: 4, y: 5, w: 2, h: 1, fill: shy ? C.mouthShy : C.mouth },
];

const TORSO = [
  { x: 3, y: 6, w: 4, h: 1, fill: C.shirt },
  { x: 2, y: 7, w: 6, h: 5, fill: C.shirt },
  { x: 2, y: 7, w: 1, h: 5, fill: C.shirtDk },
  { x: 7, y: 7, w: 1, h: 5, fill: C.shirtDk },
  { x: 3, y: 7, w: 1, h: 3, fill: C.shirtHi },
  { x: 3, y: 12, w: 4, h: 1, fill: C.pants },
];

const ARM_L = [{ x: 0, y: 7, w: 2, h: 5, fill: C.shirt }];
const ARM_L_HAND = [{ x: 0, y: 11, w: 2, h: 1, fill: C.skin }];
const ARM_R = [{ x: 8, y: 7, w: 2, h: 5, fill: C.shirt }];
const ARM_R_HAND = [{ x: 8, y: 11, w: 2, h: 1, fill: C.skin }];

const LEG_L = [
  { x: 3, y: 13, w: 2, h: 5, fill: C.pants },
  { x: 4, y: 13, w: 1, h: 5, fill: C.pantsDk },
  { x: 3, y: 18, w: 2, h: 1, fill: C.shoe },
  { x: 3, y: 18, w: 1, h: 1, fill: C.shoeHi },
];
const LEG_R = [
  { x: 5, y: 13, w: 2, h: 5, fill: C.pants },
  { x: 5, y: 13, w: 1, h: 5, fill: C.pantsDk },
  { x: 5, y: 18, w: 2, h: 1, fill: C.shoe },
  { x: 5, y: 18, w: 1, h: 1, fill: C.shoeHi },
];

// 盘腿坐姿
const SIT_LEGS = [
  { x: 2, y: 14, w: 6, h: 2, fill: C.pants },
  { x: 2, y: 13, w: 1, h: 1, fill: C.pantsDk },
  { x: 7, y: 13, w: 1, h: 1, fill: C.pantsDk },
  { x: 2, y: 16, w: 3, h: 1, fill: C.shoe },
  { x: 5, y: 16, w: 3, h: 1, fill: C.shoeHi },
];

const JOINT = {
  armL: { x: 1 * CELL, y: 7 * CELL },
  armR: { x: 9 * CELL, y: 7 * CELL },
  legL: { x: 4 * CELL, y: 13 * CELL },
  legR: { x: 6 * CELL, y: 13 * CELL },
};

// 背面（后脑勺）：整片长发 + 马尾垂下，无五官
const buildHeadBack = () => [
  { x: 3, y: 0, w: 4, h: 1, fill: C.hair },
  { x: 4, y: 0, w: 1, h: 1, fill: C.hairHi },
  { x: 2, y: 1, w: 6, h: 1, fill: C.hair },
  { x: 3, y: 1, w: 2, h: 1, fill: C.hairHi },
  { x: 2, y: 2, w: 6, h: 1, fill: C.hair },
  { x: 2, y: 3, w: 6, h: 1, fill: C.hair },
  { x: 2, y: 4, w: 6, h: 1, fill: C.hair },
  { x: 2, y: 5, w: 6, h: 1, fill: C.hair },
  { x: 2, y: 6, w: 6, h: 1, fill: C.hair }, // 长发垂到肩
  // 马尾
  { x: 8, y: 2, w: 1, h: 6, fill: C.hair },
  { x: 8, y: 2, w: 1, h: 2, fill: C.hairHi },
];

function getPose(action, mood, frame) {
  const pose = { armL: 0, armR: 0, legL: 0, legR: 0, bobY: 0 };

  if (action === "walk") {
    const p = Math.sin((frame / 16) * Math.PI * 2);
    pose.armL = p * 30;
    pose.armR = -p * 30;
    pose.legL = -p * 24;
    pose.legR = p * 24;
    pose.bobY = -Math.abs(p) * 1.5;
  } else if (action === "throw") {
    // 向后上方举臂（准备抛掷）
    const b = Math.sin((frame / 10) * Math.PI * 2);
    pose.armR = 146 + b * 3;
    pose.armL = -12 - b * 2;
    pose.legL = -7;
    pose.legR = 7;
    pose.bobY = -1.5;
  } else if (action === "trouble") {
    // 单手扶额：右臂绕到头上方，左手垂在身侧
    const b = Math.sin((frame / 15) * Math.PI * 2);
    pose.armR = 168 + b * 1.5;
    pose.armL = 10 + b * 2;
    pose.legL = 0;
    pose.legR = 0;
    pose.bobY = 2 + Math.abs(b) * 0.5;
  } else if (action === "kick") {
    // 踢腿：右腿向前高抬，身体后仰，手臂后甩
    pose.legR = -72;
    pose.legL = 14;
    pose.armL = 34;
    pose.armR = 28;
    pose.bobY = -4;
  } else if (action === "pocket") {
    // 双手插兜：手臂贴身几乎不动，只随步伐轻微晃，步子迈大
    const p = Math.sin((frame / 20) * Math.PI * 2);
    pose.armL = -5 + p * 3;
    pose.armR = 5 - p * 3;
    pose.legL = -p * 28;
    pose.legR = p * 28;
    pose.bobY = -Math.abs(p) * 1.8;
  } else if (action === "cover") {
    // 抱头躲雨：双臂抬到头顶两侧
    const b = Math.sin((frame / 9) * Math.PI * 2);
    pose.armL = 172 + b * 3;
    pose.armR = -172 - b * 3;
    pose.legL = -5;
    pose.legR = 5;
    pose.bobY = 2.5 + Math.abs(b) * 0.6;
  } else if (action === "wipe") {
    // 擦汗：右臂抬到额头，左右横擦
    const b = Math.sin((frame / 8) * Math.PI * 2);
    pose.armL = 166 + b * 8;
    pose.armR = -8;
    pose.legL = 0;
    pose.legR = 0;
    pose.bobY = 0.8;
  } else if (action === "pull") {
    // 拉行李箱：右手向后下伸握拉杆，左手自然摆动，双腿交替
    const p = Math.sin((frame / 18) * Math.PI * 2);
    pose.armL = 10 + p * 5;
    pose.armR = -30 + p * 3;
    pose.legL = -p * 20;
    pose.legR = p * 20;
    pose.bobY = -Math.abs(p) * 1.2;
  } else if (action === "sit") {
    // 坐姿：双腿前伸，手臂搭膝，身体下沉
    const b = Math.sin((frame / 24) * Math.PI * 2);
    pose.legL = -84;
    pose.legR = -84;
    pose.armL = -14 + b * 1.2;
    pose.armR = 14 - b * 1.2;
    pose.bobY = 7 + b * 0.4;
  } else if (mood === "shy") {
    // 害羞：双臂内收、身体略缩、轻微摇晃
    const b = Math.sin((frame / 20) * Math.PI * 2);
    pose.armL = -8 + b * 2;
    pose.armR = 8 - b * 2;
    pose.bobY = 1.2 + Math.abs(b) * 0.5;
  } else {
    const b = Math.sin((frame / 19) * Math.PI * 2);
    pose.armL = b * 3.5;
    pose.armR = -b * 3.5;
    pose.bobY = -Math.abs(b) * 0.4;
  }
  return pose;
}

const rot = (deg, j) => `rotate(${deg.toFixed(2)} ${j.x} ${j.y})`;

export const PixelGirl = ({
  action = "idle",
  mood = "normal",
  frame = 0,
  height = 216,
  facing = "front",
  /** 是否显示行李箱：不传则跟随 pull 动作 */
  luggage,
}) => {
  const pose = getPose(action, mood, frame);
  const showLuggage = luggage === undefined ? action === "pull" : luggage;
  const head = facing === "back" ? buildHeadBack() : buildHead(mood === "shy");
  const width = (height * 100) / 200;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 200"
      style={{
        imageRendering: "pixelated",
        overflow: "visible",
        transform: `translateY(${pose.bobY * (height / 200)}px)`,
      }}
    >
      {/* 像素行李箱（仅 pull 动作） */}
      {showLuggage && (
        <g>
          {/* 拉杆 */}
          <polygon
            points="-19.2,140.4 67.8,110.4 66.2,105.6 -20.8,135.6"
            fill="#3a3452"
          />
          <polygon
            points="-19.2,140.4 67.8,110.4 67.2,108.0 -19.6,138.4"
            fill="#55506e"
          />
          {/* 顶部提手 */}
          <rect x={-41} y={131} width={16} height={9} fill="#3a3452" />
          <rect x={-38} y={133} width={10} height={5} fill="#5a5470" />
          {/* 箱体 */}
          <rect x={-48} y={140} width={30} height={54} fill="#d4763f" />
          <rect x={-48} y={140} width={30} height={4} fill="#e8a06a" />
          <rect x={-48} y={140} width={4} height={54} fill="#b05c2c" />
          <rect x={-48} y={190} width={30} height={4} fill="#8f4520" />
          {/* 横纹 */}
          <rect x={-39} y={152} width={13} height={3} fill="#b05c2c" />
          <rect x={-39} y={163} width={13} height={3} fill="#b05c2c" />
          {/* 轮子 */}
          <rect x={-47} y={194} width={9} height={6} fill="#2a2436" />
          <rect x={-28} y={194} width={9} height={6} fill="#2a2436" />
          <rect x={-45} y={196} width={4} height={2} fill="#6a6480" />
          <rect x={-26} y={196} width={4} height={2} fill="#6a6480" />
        </g>
      )}

      <g transform={rot(pose.armL, JOINT.armL)}>
        {ARM_L.map((c, i) => <R key={`al${i}`} {...c} />)}
        {ARM_L_HAND.map((c, i) => <R key={`alh${i}`} {...c} />)}
      </g>
      <g transform={rot(pose.armR, JOINT.armR)}>
        {ARM_R.map((c, i) => <R key={`ar${i}`} {...c} />)}
        {ARM_R_HAND.map((c, i) => <R key={`arh${i}`} {...c} />)}
      </g>
      {action === "sit" ? (
        <>
          {SIT_LEGS.map((c, i) => <R key={`sl${i}`} {...c} />)}
        </>
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
