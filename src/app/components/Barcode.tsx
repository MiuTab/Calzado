// Code128B barcode renderer — value 0=ASCII32 ... 95=ASCII127, 103=START_A, 104=START_B, 105=START_C, 106=STOP
const PATTERNS: string[] = [
  "212222","222122","222221","121223","121322","131222","122213","122312",
  "132212","221213","221312","231212","112232","122132","122231","113222",
  "123122","123221","223211","221132","221231","213212","223112","312131",
  "311222","321122","321221","312212","322112","322211","212123","212321",
  "232121","111323","131123","131321","112313","132113","132311","211313",
  "231113","231311","112133","112331","132131","113123","113321","133121",
  "313121","211331","231131","213113","213311","213131","311123","311321",
  "331121","312113","312311","332111","314111","221411","431111","111224",
  "111422","121124","121421","141122","141221","112214","112412","122114",
  "122411","142112","142211","241211","221114","413111","241112","134111",
  "111242","121142","121241","114212","124112","124211","411212","421112",
  "421211","212141","214121","412121","111143","111341","131141","114113",
  "114311","411113","411311","113141","114131","311141","411131","211412",
  "211214","211232","2331112",
];

const START_B = 104;
const STOP = 106;
const MODULE_W = 2;
const QUIET = 8;

function encodeCode128B(text: string): number[] {
  const vals: number[] = [START_B];
  let checksum = START_B;
  const clean = text.replace(/[^\x20-\x7E]/g, '');
  for (let i = 0; i < clean.length; i++) {
    const v = clean.charCodeAt(i) - 32;
    vals.push(v);
    checksum += v * (i + 1);
  }
  vals.push(checksum % 103);
  vals.push(STOP);
  return vals;
}

interface BarcodeProps {
  code: string;
  height?: number;
  showText?: boolean;
  color?: string;
}

export function Barcode({ code, height = 56, showText = true, color = '#1A1917' }: BarcodeProps) {
  const vals = encodeCode128B(code);
  const rects: { x: number; w: number }[] = [];
  let x = QUIET * MODULE_W;

  for (const val of vals) {
    const pat = PATTERNS[val];
    let isBar = true;
    for (const ch of pat) {
      const w = parseInt(ch) * MODULE_W;
      if (isBar) rects.push({ x, w });
      x += w;
      isBar = !isBar;
    }
    if (val === STOP) {
      rects.push({ x, w: MODULE_W * 2 });
      x += MODULE_W * 2;
    }
  }

  const totalW = x + QUIET * MODULE_W;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={totalW} height={height} style={{ display: 'block' }}>
        {rects.map((r, i) => (
          <rect key={i} x={r.x} y={0} width={r.w} height={height} fill={color} />
        ))}
      </svg>
      {showText && (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.12em', color }}>
          {code}
        </span>
      )}
    </div>
  );
}
