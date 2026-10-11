/**
 * Panandaliang render + resilience test para sa buong site.
 *
 * Mahalagang note: ang SSR ay HINDI nagpapatakbo ng useEffect, kaya ang
 * constructor ng HimayaScene ay hindi nasusubukan rito noon — kaya may
 * hiwalay na static audit sa ibaba. Patakbuhin: npm run test:smoke
 */
import fs from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import App from './src/App.jsx';
import {
  detectTagalogVoices,
  preprocessTagalogText,
  chunkTextForSpeech,
} from './src/lib/tagalogTTS.js';

// Ang compiled bundle ay nasa .smoke/, kaya ang source ng client ay
// hinahanap mula sa client root (process.cwd()) at hindi mula sa bundle.
const here = process.cwd();
const read = (relative) => fs.readFileSync(path.join(here, relative), 'utf8');

// ---------------------------------------------------------------- 1. render

const html = renderToString(<App />);

const renderChecks = [
  ['Ang Himaya hero', html.includes('Ang Himaya')],
  ['Preloader', html.includes('preloader')],
  ['Canvas', html.includes('<canvas')],
  ['Dateline', html.includes('Politeknikong Unibersidad')],
  ['Publication shell', html.includes('publication')],
  ['Nav', html.includes('site-nav')],
  ['Balita', html.includes('id="top-story"')],
  ['Kolum at Opinyon', html.includes('id="voices"')],
  ['Silakbo', html.includes('id="silakbo"')],
  ['Mga Edisyon', html.includes('id="editions"')],
  ['Mga Edisyon: archive na walang laman', html.includes('Wala pang naitalang edisyon.')],
  ['Patnugutan', html.includes('id="masthead"')],
  ['Subscribe', html.includes('id="subscribe"')],
  ['Footer', html.includes('footer__bottom')],
  ['Lead article', html.includes('WEATHER ADVISORY') || html.includes('Heat Index')],
  ['Voices / Paggunita', html.includes('Gu-‘RAW’') || html.includes('Gu-RAW') || html.includes('Pio Matienzo') || html.includes('PAGGUNITA')],
  ['News cards', html.includes('Teachers’ Day') || html.includes('Morning Zumba') || html.includes('LMS')],
  ['Silakbo / Kartun', html.includes('Freshman Starter Pack') || html.includes('Bryan Nuite') || html.includes('Sabado')],
  ['Error boundary', html.includes('publication')],
];

// ------------------------------------- 2. static audit ng HimayaScene class
// Ito ang check na nahuli ang `this.initScene()` — isang tawag sa paraang
// walang defines, na nagbibigay ng itim na pahina sa browser.

const sceneSource = read('src/scene/HimayaScene.js');

const defined = new Set(
  [...sceneSource.matchAll(/^\s*(?:async\s+)?#?(\w+)\s*\([^)]*\)\s*\{/gm)].map((m) => m[1]),
);
const properties = new Set([...sceneSource.matchAll(/this\.(\w+)\s*=/g)].map((m) => m[1]));
const called = new Set([...sceneSource.matchAll(/this\.(\w+)\s*\(/g)].map((m) => m[1]));

const missing = [...called].filter((name) => !defined.has(name) && !properties.has(name));

const auditChecks = [
  ['Scene: walang nawawalang this.method()', missing.length === 0],
  ['Scene: may markAssetLoaded', defined.has('markAssetLoaded')],
  ['Scene: may reportAssetFailure', defined.has('reportAssetFailure')],
  ['Scene: may reportProgress', defined.has('reportProgress')],
  ['Scene: may destroy', defined.has('destroy')],
];

// --------------------------------- 3. resilience: hindi dapat hadlang ng UI

const heroSource = read('src/scene/SceneHero.jsx');
const appSource = read('src/App.jsx');
const css = read('src/styles/global.css');

const resilienceChecks = [
  ['Hero: may failsafe timeout', /PRELOADER_TIMEOUT_MS\s*=\s*\d+/.test(heroSource)],
  [
    'Hero: dismisses kahit may asset na nabigo',
    /meta\.settled\s*>=\s*meta\.total/.test(heroSource),
  ],
  ['Hero: may try/catch sa mount', /try\s*\{[\s\S]*mountScene/.test(heroSource)],
  ['Hero: SceneErrorBoundary ang nakakapaloob', appSource.includes('SceneErrorBoundary')],
  ['Preloader: visibility hidden kapag done', /\.preloader--done[\s\S]{0,160}visibility:\s*hidden/.test(css)],
  [
    'Audio: may try/catch sa AudioContext',
    /initAudioGraph\(\)\s*\{[\s\S]{0,200}try\s*\{/.test(sceneSource),
  ],
];

// ------------------------------------------- 4. tagalog tts speech audit

const testRaw =
  'Pormal na pagpupulong ng mga mag-aaral ng PUP Lopez para sa REELE. ₱500 bawat isa.';
const processedNative = preprocessTagalogText(testRaw, 'native-filipino');
const chunks = chunkTextForSpeech(processedNative, 8);
const voicesCheck = detectTagalogVoices([
  { name: 'Microsoft David', lang: 'en-US' },
  { name: 'Microsoft Blessica Online (Natural) - Filipino (Philippines)', lang: 'fil-PH' },
]);

const ttsChecks = [
  ['TTS: binibigkas ang "mga" bilang "manga"', processedNative.includes('manga mag aaral')],
  [
    'TTS: binibigkas ang "ng" bilang "nang"',
    processedNative.includes('nang manga mag aaral nang P. U. P.'),
  ],
  ['TTS: inaayos ang PUP acronym', processedNative.includes('P. U. P.')],
  ['TTS: inaayos ang salapi (₱)', processedNative.includes('500 piso')],
  ['TTS: may sentence chunking laban sa timeout', chunks.length >= 2],
  ['TTS: natutukoy ang Filipino voice (Blessica/fil-PH)', voicesCheck.tier === 'native-filipino'],
];

// ----------------------------------------------------------------- 5. run it

const groups = [
  ['RENDER', renderChecks],
  ['SCENE AUDIT', auditChecks],
  ['RESILIENCE', resilienceChecks],
  ['TAGALOG TTS', ttsChecks],
];

let failed = 0;

for (const [title, checks] of groups) {
  console.log('\n' + title);
  for (const [label, pass] of checks) {
    console.log('  ' + (pass ? 'PASS' : 'FAIL') + '  ' + label);
    if (!pass) failed += 1;
  }
}

if (missing.length) {
  console.log('\n  Missing methods na tinawag pero walang defines: ' + missing.join(', '));
}

console.log('\n' + html.length + ' bytes ang na-render na HTML.');
console.log(
  failed > 0 ? '\n' + failed + ' na check ang nabigo.' : '\nLahat ng check ay pumasa.',
);

process.exit(failed > 0 ? 1 : 0);