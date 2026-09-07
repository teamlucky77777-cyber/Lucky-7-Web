/* [v1303·감사 LATER-D] 배포용 스트립 — 원본(main)은 주석을 간직하고, 배포본만 벗긴다.
   보존 규칙:
   ① 맨 위 BUILD 주석 — _APP_BUILD 가 head의 주석 노드에서 읽고, _checkVersion 이
      배포된 페이지의 첫 512바이트에서 정규식으로 읽는다. 지우면 새버전 배너가 고장난다.
   ② <script type="text/html"> 템플릿(kbRaceBody)은 건드리지 않는다(기본 동작).
   안전 규칙: 압축·이름변경·공백접기 전부 끔 — 주석 제거만. 검증 실패 시 예외 → 워크플로가 원본 복사로 후퇴. */
import { minify } from 'html-minifier-terser';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const src = readFileSync('index.html', 'utf8');
const out = await minify(src, {
  removeComments: true,
  ignoreCustomComments: [/^ ?BUILD:/],
  minifyJS: { compress: false, mangle: false, format: { comments: false } },
  minifyCSS: false,
  collapseWhitespace: false,
});

if (!/BUILD:\s*v\d+/.test(out.slice(0, 512))) throw new Error('BUILD marker missing from first 512 bytes');
if (out.length < src.length * 0.5) throw new Error('suspicious shrink: ' + out.length + ' / ' + src.length);
if (!out.includes('kbRaceBody')) throw new Error('race template lost');

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', out);
console.log('stripped:', src.length, '->', out.length, '(' + Math.round((1 - out.length / src.length) * 100) + '% smaller)');
