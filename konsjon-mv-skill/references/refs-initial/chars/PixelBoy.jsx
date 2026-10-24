import React from "react";

/**
 * PixelBoy —— 纯代码 8-bit 像素小人（完整全身：头 / 躯干 / 双臂 / 双腿）
 *
 * 用 SVG 色块（rect）拼装，每个部件独立成组，
 * 通过绕「关节」旋转实现 idle / walk / point 三种动作。
 *
 * 坐标系统：10 格宽 × 20 格高，每格 10 单位 → viewBox 0 0 100 200
 *
 * 接口：
 *   action: "idle" | "walk" | "point"
 *   frame:  当前帧号
 *   height: 渲染高度（px），默认 216 —— 约屏幕高度的 1/5
 */

const CELL = 10; // 每格世界单位

// 色板
const C = {
  hair: "#1b1b28",
  hairHi: "#3d3d58",
  skin: "#f5c89b",
  skinDk: "#e0a878",
  eye: "#14141c",
  mouth: "#c0553a",
  shirt: "#2f6fd0",
  shirtDk: "#1f4fa0",
  shirtHi: "#4a8ae8",
  pants: "#3d3d57",
  pantsDk: "#2a2a3e",
  shoe: "#1a1a26",
  shoeHi: "#3a3a4e",
};

/** 快捷画方块：x/y/w/h 以「格」为单位 */
const R = ({ x, y, w = 1, h = 1, fill, opacity }) => (
  <rect
    x={x * CELL}
    y={y * CELL}
    width={w * CELL}
    height={h * CELL}
    fill={fill}
    opacity={opacity}
  />
);

// ---------- 部件色块定义 ----------

// 头部 + 五官（含少量颈部）
const HEAD = [
  { x: 3, y: 0, w: 4, h: 1, fill: C.hair }, // 头顶
  { x: 4, y: 0, w: 1, h: 1, fill: C.hairHi }, // 发顶高光
  { x: 2, y: 1, w: 6, h: 1, fill: C.hair },
  { x: 2, y: 1, w: 2, h: 1, fill: C.hairHi }, // 发际高光
  { x: 2, y: 2, w: 6, h: 1, fill: C.hair }, // 刘海
  { x: 2, y: 3, w: 6, h: 1, fill: C.skin }, // 额头
  { x: 3, y: 3, w: 1, h: 1, fill: C.eye }, // 左眼
  { x: 6, y: 3, w: 1, h: 1, fill: C.eye }, // 右眼
  { x: 2, y: 4, w: 6, h: 1, fill: C.skin }, // 脸颊
  { x: 2, y: 4, w: 1, h: 1, fill: C.skinDk }, // 侧脸暗部
  { x: 7, y: 4, w: 1, h: 1, fill: C.skinDk },
  { x: 3, y: 5, w: 4, h: 1, fill: C.skin }, // 下巴
  { x: 4, y: 5, w: 2, h: 1, fill: C.mouth }, // 嘴
];

// 躯干（上衣 + 腰带）
const TORSO = [
  { x: 3, y: 6, w: 4, h: 1, fill: C.shirt }, // 颈肩
  { x: 2, y: 7, w: 6, h: 5, fill: C.shirt }, // 上身
  { x: 2, y: 7, w: 1, h: 5, fill: C.shirtDk }, // 左侧暗部
  { x: 7, y: 7, w: 1, h: 5, fill: C.shirtDk }, // 右侧暗部
  { x: 3, y: 7, w: 1, h: 4, fill: C.shirtHi }, // 胸前高光
  { x: 4, y: 9, w: 2, h: 1, fill: C.shirtDk }, // 衣褶
  { x: 3, y: 12, w: 4, h: 1, fill: C.pants }, // 腰带
];

// 左臂（绕肩关节旋转）
const ARM_L = [{ x: 0, y: 7, w: 2, h: 5, fill: C.shirt }];
const ARM_L_HAND = [{ x: 0, y: 11, w: 2, h: 1, fill: C.skin }];
// 右臂
const ARM_R = [{ x: 8, y: 7, w: 2, h: 5, fill: C.shirt }];
const ARM_R_HAND = [{ x: 8, y: 11, w: 2, h: 1, fill: C.skin }];

// 腿（含裤缝暗线与鞋面高光）
const LEG_L = [
  { x: 3, y: 13, w: 2, h: 5, fill: C.pants },
  { x: 4, y: 13, w: 1, h: 5, fill: C.pantsDk }, // 裤缝
  { x: 3, y: 18, w: 2, h: 1, fill: C.shoe },
  { x: 3, y: 18, w: 1, h: 1, fill: C.shoeHi }, // 鞋面高光
];
const LEG_R = [
  { x: 5, y: 13, w: 2, h: 5, fill: C.pants },
  { x: 5, y: 13, w: 1, h: 5, fill: C.pantsDk },
  { x: 5, y: 18, w: 2, h: 1, fill: C.shoe },
  { x: 5, y: 18, w: 1, h: 1, fill: C.shoeHi },
];

// 关节中心（世界单位）
const JOINT = {
  armL: { x: 1 * CELL, y: 7 * CELL }, // 左肩
  armR: { x: 9 * CELL, y: 7 * CELL }, // 右肩
  legL: { x: 4 * CELL, y: 13 * CELL }, // 左髋
  legR: { x: 6 * CELL, y: 13 * CELL }, // 右髋
};

/**
 * 计算各部件当前角度（度）。
 */
function getPose(action, frame) {
  const pose = {
    armL: 0,
    armR: 0,
    legL: 0,
    legR: 0,
    bobY: 0, // 整体上下偏移（世界单位）
  };

  if (action === "walk") {
    // 一个完整步态周期 16 帧
    const p = Math.sin((frame / 16) * Math.PI * 2);
    pose.armL = p * 33; // 左臂向前
    pose.armR = -p * 33; // 右臂反向
    pose.legL = -p * 26; // 左腿反向
    pose.legR = p * 26;
    // 每半个周期身体起伏一次
    pose.bobY = -Math.abs(p) * 1.6;
  } else if (action === "catch") {
    // 接球：右臂竖直向上举起，身体微微后仰
    const b = Math.sin((frame / 10) * Math.PI * 2);
    pose.armR = 172 + b * 1.5;
    pose.armL = -12;
    pose.legL = 0;
    pose.legR = 0;
    pose.bobY = -1.5;
  } else if (action === "point") {
    // 右臂抬起指向右侧（绕肩逆时针转 78°）
    pose.armR = -78;
    // 左臂自然微垂
    pose.armL = 4;
    pose.legL = 0;
    pose.legR = 0;
    pose.bobY = 0;
  } else if (action === "sit") {
    // 坐姿：双腿向前平伸（被躯干遮住大半），身体下沉，手臂自然搭在膝上
    const b = Math.sin((frame / 22) * Math.PI * 2);
    pose.legL = -84;
    pose.legR = -84;
    pose.armL = 16 + b * 1.5;
    pose.armR = -16 - b * 1.5;
    pose.bobY = 7 + b * 0.5;
  } else {
    // idle：呼吸式极轻微摆动
    const b = Math.sin((frame / 18) * Math.PI * 2);
    pose.armL = b * 3.5;
    pose.armR = -b * 3.5;
    pose.legL = 0;
    pose.legR = 0;
    pose.bobY = -Math.abs(b) * 0.4;
  }

  return pose;
}

// 背面（后脑勺）：整片头发，无五官
const HEAD_BACK = [
  { x: 3, y: 0, w: 4, h: 1, fill: C.hair },
  { x: 4, y: 0, w: 1, h: 1, fill: C.hairHi },
  { x: 2, y: 1, w: 6, h: 1, fill: C.hair },
  { x: 3, y: 1, w: 2, h: 1, fill: C.hairHi },
  { x: 2, y: 2, w: 6, h: 1, fill: C.hair },
  { x: 2, y: 3, w: 6, h: 1, fill: C.hair },
  { x: 2, y: 4, w: 6, h: 1, fill: C.hair },
  { x: 2, y: 4, w: 6, h: 1, fill: C.hair },
  { x: 3, y: 5, w: 4, h: 1, fill: C.hair },
];

// 盘腿坐姿（替代腿部，避免从背面看像"趴着伸腿"）
const SIT_LEGS = [
  { x: 2, y: 14, w: 6, h: 2, fill: C.pants },
  { x: 2, y: 13, w: 1, h: 1, fill: C.pantsDk },
  { x: 7, y: 13, w: 1, h: 1, fill: C.pantsDk },
  { x: 2, y: 16, w: 3, h: 1, fill: C.shoe },
  { x: 5, y: 16, w: 3, h: 1, fill: C.shoe },
];

const rot = (deg, j) => `rotate(${deg.toFixed(2)} ${j.x} ${j.y})`;

export const PixelBoy = ({
  action = "idle",
  frame = 0,
  height = 216,
  facing = "front",
}) => {
  const pose = getPose(action, frame);
  const width = (height * 100) / 200; // 保持 1:2 比例
  const headParts = facing === "back" ? HEAD_BACK : HEAD;

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
      {/* 左臂 */}
      <g transform={rot(pose.armL, JOINT.armL)}>
        {ARM_L.map((c, i) => (
          <R key={`al${i}`} {...c} />
        ))}
        {ARM_L_HAND.map((c, i) => (
          <R key={`alh${i}`} {...c} />
        ))}
      </g>

      {/* 右臂 */}
      <g transform={rot(pose.armR, JOINT.armR)}>
        {ARM_R.map((c, i) => (
          <R key={`ar${i}`} {...c} />
        ))}
        {ARM_R_HAND.map((c, i) => (
          <R key={`arh${i}`} {...c} />
        ))}
      </g>

      {/* 腿（坐姿用盘腿，其余用正常腿） */}
      {action === "sit" ? (
        <>
          {SIT_LEGS.map((c, i) => (
            <R key={`sl${i}`} {...c} />
          ))}
        </>
      ) : (
        <>
          <g transform={rot(pose.legL, JOINT.legL)}>
            {LEG_L.map((c, i) => (
              <R key={`ll${i}`} {...c} />
            ))}
          </g>
          <g transform={rot(pose.legR, JOINT.legR)}>
            {LEG_R.map((c, i) => (
              <R key={`lr${i}`} {...c} />
            ))}
          </g>
        </>
      )}

      {/* 躯干（盖住四肢连接处） */}
      {TORSO.map((c, i) => (
        <R key={`t${i}`} {...c} />
      ))}

      {/* 头 */}
      {headParts.map((c, i) => (
        <R key={`h${i}`} {...c} />
      ))}
    </svg>
  );
};
