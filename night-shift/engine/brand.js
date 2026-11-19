// Channel branding: profile picture (1080x1080) and YouTube banner (2560x1440)
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');
const D = require('./draw');
const { C, glow, spaced } = D;
const OUT = path.join(__dirname, '..', 'brand'); fs.mkdirSync(OUT, { recursive: true });

function grinHead(ctx, x, y, s) {
  D.drawStick(ctx, { x, y: y + 338 * s, s, view: 'front', arm: 'down', bust: true, fill: '#0b1022', grin: 1 });
}

async function pfp() {
  const c = createCanvas(1080, 1080), x = c.getContext('2d');
  const g = x.createRadialGradient(540, 520, 60, 540, 540, 760); g.addColorStop(0, '#1a2347'); g.addColorStop(1, '#04060c');
  x.fillStyle = g; x.fillRect(0, 0, 1080, 1080);
  glow(x, 540, 560, 520, 'rgba(255,40,60,A)', 0.22);
  // head fills the circle crop
  x.save(); x.translate(540, 530); x.scale(5.0, 5.0);
  D.drawStick(x, { x: 0, y: 338, s: 1, view: 'front', arm: 'down', bust: true, fill: '#0b1022', grin: 1 });
  x.restore();
  fs.writeFileSync(path.join(OUT, 'pfp.png'), await c.encode('png'));
  fs.writeFileSync(path.join(OUT, 'pfp.jpg'), await c.encode('jpeg', 95));
}

async function banner() {
  const W = 2560, H = 1440, c = createCanvas(W, H), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1022'); g.addColorStop(1, '#04060c');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  glow(x, W / 2, H / 2, 900, 'rgba(255,40,60,A)', 0.12);
  // dot-matrix 0 on the left of the safe area, grin head on the right
  D.drawIndicator(x, 640, 720, 22, { ch: '0', arrow: ' ' });
  x.save(); x.translate(1980, 760); x.scale(1.6, 1.6); D.drawStick(x, { x: 0, y: 338, s: 1, view: 'front', arm: 'down', bust: true, fill: '#0b1022', grin: 1 }); x.restore();
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '150px Mont900'; x.fillStyle = C.white; x.fillText("DON'T LET IT SEE", W / 2, 690);
  x.font = '40px Mono700'; x.fillStyle = C.red; spaced(x, 'INTERACTIVE HORROR · A NEW PART EVERY NIGHT · YOU CHOOSE', W / 2, 800, 6, 'center');
  fs.writeFileSync(path.join(OUT, 'yt_banner.jpg'), await c.encode('jpeg', 92));
}

(async () => { await pfp(); await banner(); console.log('brand done', OUT); })();
