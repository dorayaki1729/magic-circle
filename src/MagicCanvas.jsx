import { useRef, useState, useEffect } from "react";

const COLORS = ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff4444", "#ffffff"];

export default function MagicCanvas() {
  const canvasRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [segments, setSegments] = useState(12);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(2);
  const [eraser, setEraser] = useState(false);
  const [glow, setGlow] = useState(10);
  const [canvasSize] = useState(800);

  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const rotatePoint = (x, y, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos
    };
  };

  const drawSymmetryLine = (from, to) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const step = (Math.PI * 2) / segments;

    ctx.lineWidth = size;
    ctx.lineCap = "round";

    if (eraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.shadowBlur = 0;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.shadowBlur = glow;
      ctx.shadowColor = color;
    }

    for (let i = 0; i < segments; i++) {
      const angle = step * i;

      const p1 = rotatePoint(from.x, from.y, angle);
      const p2 = rotatePoint(to.x, to.y, angle);

      ctx.beginPath();
      ctx.moveTo(p1.x + cx, p1.y + cy);
      ctx.lineTo(p2.x + cx, p2.y + cy);
      ctx.stroke();
    }
  };

  const handleDown = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    lastPos.current = {
      x: e.clientX - rect.left - cx,
      y: e.clientY - rect.top - cy
    };

    setDrawing(true);
  };

  const handleMove = e => {
    if (!drawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const current = {
      x: e.clientX - rect.left - cx,
      y: e.clientY - rect.top - cy
    };

    drawSymmetryLine(lastPos.current, current);
    lastPos.current = current;
  };

  const handleUp = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const savePNG = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "magic_circle.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      {/* UI */}
      <div style={{ width: "260px", padding: "16px", background: "#181818", color: "#fff" }}>
        <h3>魔法陣作成ツール</h3>

        <div>
          対称数
          <input
            type="range"
            min="2"
            max="36"
            value={segments}
            onChange={e => setSegments(Number(e.target.value))}
          />
          {segments}
        </div>

        <div>
          線の太さ
          <input
            type="range"
            min="1"
            max="12"
            value={size}
            onChange={e => setSize(Number(e.target.value))}
          />
          {size}
        </div>

        <div>
          線の発光
          <input
            type="range"
            min="0"
            max="40"
            value={glow}
            onChange={e => setGlow(Number(e.target.value))}
          />
          {glow}
        </div>

        <div style={{ marginTop: "8px" }}>
          色
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: "6px" }}>
            {COLORS.map(c => (
              <div
                key={c}
                onClick={() => {
                  setColor(c);
                  setEraser(false);
                }}
                style={{
                  width: "26px",
                  height: "26px",
                  background: c,
                  marginRight: "6px",
                  marginBottom: "6px",
                  border: color === c && !eraser ? "2px solid #fff" : "1px solid #333",
                  cursor: "pointer"
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => setEraser(!eraser)}
            style={{
              width: "100%",
              padding: "8px",
              background: eraser ? "#aa3333" : "#333",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            {eraser ? "消しゴム ON" : "消しゴム OFF"}
          </button>
        </div>

        <button
          onClick={clearCanvas}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "8px",
            background: "#333",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          全消去
        </button>

        <button
          onClick={savePNG}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "8px",
            background: "#2255aa",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          PNG保存
        </button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          style={{ border: "1px solid #333", cursor: "crosshair" }}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
        />
      </div>
    </>
  );
}