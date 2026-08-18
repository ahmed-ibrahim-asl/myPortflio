export function DiagramFrame({ viewBox, height = 200, caption, children }) {
  return (
    <div className="tool-diagram">
      <svg viewBox={viewBox} role="img" aria-label={caption} style={{ height }}>
        {children}
      </svg>
      {caption ? <p className="tool-diagram-caption mono muted">{caption}</p> : null}
    </div>
  );
}

export function Wire({ x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth="2" />;
}

export function NodeDot({ x, y }) {
  return <circle cx={x} cy={y} r="3.5" fill="var(--ink)" />;
}

export function GroundSymbol({ x, y }) {
  return (
    <g stroke="var(--ink)" strokeWidth="2">
      <line x1={x} y1={y} x2={x} y2={y + 10} />
      <line x1={x - 14} y1={y + 10} x2={x + 14} y2={y + 10} />
      <line x1={x - 9} y1={y + 16} x2={x + 9} y2={y + 16} />
      <line x1={x - 4} y1={y + 22} x2={x + 4} y2={y + 22} />
    </g>
  );
}

export function ResistorH({ x, y, width, label }) {
  const segs = 6;
  const amp = 9;
  const step = width / segs;
  let d = `M ${x} ${y}`;
  for (let i = 0; i < segs; i++) {
    const midX = x + step * i + step / 2;
    const midY = y + (i % 2 === 0 ? -amp : amp);
    d += ` L ${midX} ${midY}`;
  }
  d += ` L ${x + width} ${y}`;
  return (
    <g>
      <path d={d} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      {label ? (
        <text x={x + width / 2} y={y - amp - 8} textAnchor="middle" className="diagram-label">
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function ResistorV({ x, y, height, label }) {
  const segs = 6;
  const amp = 9;
  const step = height / segs;
  let d = `M ${x} ${y}`;
  for (let i = 0; i < segs; i++) {
    const midY = y + step * i + step / 2;
    const midX = x + (i % 2 === 0 ? -amp : amp);
    d += ` L ${midX} ${midY}`;
  }
  d += ` L ${x} ${y + height}`;
  return (
    <g>
      <path d={d} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      {label ? (
        <text x={x + amp + 12} y={y + height / 2 + 4} className="diagram-label">
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function CapacitorH({ x, y, label }) {
  const plateGap = 10;
  const plateHeight = 24;
  const leadIn = 20;
  const leadOut = 20;
  return (
    <g stroke="var(--ink)">
      <line x1={x} y1={y} x2={x + leadIn} y2={y} strokeWidth="2" />
      <line x1={x + leadIn} y1={y - plateHeight / 2} x2={x + leadIn} y2={y + plateHeight / 2} strokeWidth="3" />
      <line
        x1={x + leadIn + plateGap}
        y1={y - plateHeight / 2}
        x2={x + leadIn + plateGap}
        y2={y + plateHeight / 2}
        strokeWidth="3"
      />
      <line x1={x + leadIn + plateGap} y1={y} x2={x + leadIn + plateGap + leadOut} y2={y} strokeWidth="2" />
      {label ? (
        <text
          x={x + leadIn + plateGap / 2}
          y={y - plateHeight / 2 - 10}
          textAnchor="middle"
          className="diagram-label"
          stroke="none"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function CapacitorV({ x, y, label }) {
  const plateGap = 10;
  const plateWidth = 24;
  const leadIn = 20;
  const leadOut = 20;
  return (
    <g stroke="var(--ink)">
      <line x1={x} y1={y} x2={x} y2={y + leadIn} strokeWidth="2" />
      <line x1={x - plateWidth / 2} y1={y + leadIn} x2={x + plateWidth / 2} y2={y + leadIn} strokeWidth="3" />
      <line
        x1={x - plateWidth / 2}
        y1={y + leadIn + plateGap}
        x2={x + plateWidth / 2}
        y2={y + leadIn + plateGap}
        strokeWidth="3"
      />
      <line x1={x} y1={y + leadIn + plateGap} x2={x} y2={y + leadIn + plateGap + leadOut} strokeWidth="2" />
      {label ? (
        <text x={x + plateWidth / 2 + 12} y={y + leadIn + plateGap / 2 + 5} className="diagram-label" stroke="none">
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function capacitorVHeight() {
  return 50;
}

