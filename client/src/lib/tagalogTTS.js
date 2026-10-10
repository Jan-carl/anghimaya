/**
 * Tagalog Text-To-Speech (TTS) Engine para sa Ang Himaya
 *
 * Nagbibigay ng:
 * 1. Matalinong pagtuklas ng boses sa Tagalog / Filipino (fil-PH, tl-PH, en-PH fallback)
 * 2. Natural na Tagalog text pre-processing (binibigkas ang "mga" bilang "manga",
 *    ang "ng" bilang "nang", pag-aayos ng glottal stops at akronim)
 * 3. Chunking para maiwasan ang 15-segundong Chromium speech timeout bug
 */

/**
 * Tuklasin at uriin ang mga available na boses mula sa browser
 */
export function detectTagalogVoices(voices = []) {
  if (!Array.isArray(voices) || voices.length === 0) {
    return {
      bestVoice: null,
      filipinoVoices: [],
      philippineEnglishVoices: [],
      compatibleVoices: [],
      tier: 'fallback',
      voiceLabel: 'Tagalog Mode (Phonetic)',
    };
  }

  // 1. Katutubong Filipino / Tagalog voices (fil-PH, tl-PH, Blessica, Angelo, Google Tagalog, Karen, Mabuti)
  const filipinoVoices = voices.filter((v) => {
    const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
    const name = (v.name || '').toLowerCase();
    return (
      lang === 'fil' ||
      lang === 'fil-ph' ||
      lang === 'tl' ||
      lang === 'tl-ph' ||
      lang.startsWith('fil-') ||
      lang.startsWith('tl-') ||
      name.includes('filipino') ||
      name.includes('tagalog') ||
      name.includes('blessica') ||
      name.includes('angelo') ||
      name.includes('mabuti')
    );
  });

  // 2. Philippine English voices (May natural na Filipino accent at cadence sa pagbigkas ng patinig)
  const philippineEnglishVoices = voices.filter((v) => {
    const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
    const name = (v.name || '').toLowerCase();
    return (
      (lang === 'en-ph' || lang.startsWith('en-ph') || name.includes('philippines')) &&
      !filipinoVoices.includes(v)
    );
  });

  const compatibleVoices = [...filipinoVoices, ...philippineEnglishVoices];

  let bestVoice = null;
  let tier = 'fallback';
  let voiceLabel = 'Tagalog Mode (Phonetic)';

  if (filipinoVoices.length > 0) {
    // Unahin ang natural/neural voices kung mayroon
    bestVoice =
      filipinoVoices.find((v) => v.name.toLowerCase().includes('natural')) ||
      filipinoVoices.find((v) => v.name.toLowerCase().includes('google')) ||
      filipinoVoices[0];
    tier = 'native-filipino';

    // Malinis na pangalan para sa badge
    const rawName = bestVoice.name || 'Filipino';
    if (rawName.includes('Blessica')) voiceLabel = 'Filipino (Blessica)';
    else if (rawName.includes('Angelo')) voiceLabel = 'Filipino (Angelo)';
    else if (rawName.includes('Google')) voiceLabel = 'Google Tagalog';
    else voiceLabel = 'Tagalog (fil-PH)';
  } else if (philippineEnglishVoices.length > 0) {
    bestVoice =
      philippineEnglishVoices.find((v) => v.name.toLowerCase().includes('natural')) ||
      philippineEnglishVoices.find((v) => v.name.toLowerCase().includes('google')) ||
      philippineEnglishVoices[0];
    tier = 'philippine-english';

    const rawName = bestVoice.name || 'Philippine English';
    if (rawName.includes('Rosa')) voiceLabel = 'Filipino Accent (Rosa)';
    else if (rawName.includes('James')) voiceLabel = 'Filipino Accent (James)';
    else voiceLabel = 'Filipino Accent (en-PH)';
  } else {
    // Default system voice (e.g. David / Zira / system voice) na lalapatan ng phonetic enhancement
    bestVoice = voices.find((v) => v.default) || voices[0] || null;
    tier = 'fallback';
    voiceLabel = 'Tagalog Mode (Phonetic)';
  }

  return {
    bestVoice,
    filipinoVoices,
    philippineEnglishVoices,
    compatibleVoices,
    tier,
    voiceLabel,
  };
}

/**
 * Pre-process ng teksto para sa maayos na pagbigkas sa Tagalog:
 * - Hindi babaybayin ang "mga" bilang "M-G-A", bagkus bibigkasin bilang "manga"
 * - Ang "ng" ay bibigkasin bilang "nang"
 * - Inaayos ang mga akronim, pera, at glottal stop sa gitna ng salita
 */
export function preprocessTagalogText(rawText = '', tier = 'fallback') {
  if (!rawText) return '';

  let text = String(rawText);

  // 1. Linisin ang HTML tags at typographic quotes
  text = text.replace(/<[^>]*>/g, ' ');
  text = text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

  // 1b. Temperatura at Saklaw ng Panahon (hal. 27–32°C, 33–41°C, 30°C)
  text = text.replace(/(\d+)\s*[-–—]\s*(\d+)\s*°\s*C\b/gi, '$1 hanggang $2 degrees Celsius');
  text = text.replace(/(\d+)\s*°\s*C\b/gi, '$1 degrees Celsius');

  // 1c. Oras (hal. alas-8 ng umaga, alas-11, alas-2)
  text = text.replace(/\balas-(\d+)\b/gi, 'alas $1');

  // 1d. Typographic dashes patungong natural na pause
  text = text
    .replace(/[—–]/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Salapi at Halaga (₱500 -> 500 piso)
  text = text.replace(/₱\s*(\d+(?:,\d+)*(?:\.\d+)?)/g, '$1 piso');
  text = text.replace(/\b(?:Php|PHP)\s*(\d+(?:,\d+)*(?:\.\d+)?)/g, '$1 piso');

  // 3. Mga Ordinals (ika-47 -> ika 47 para hindi banggitin ang salitang 'hyphen')
  text = text.replace(/\b([Ii])ka-(\d+)\b/g, '$1ka $2');

  // 4. Pamantasan at Opisyal na Akronim
  text = text.replace(/\bPUPLC\b/g, 'P. U. P. L. C.');
  text = text.replace(/\bPUP\b/g, 'P. U. P.');
  text = text.replace(/\bCEA\b/g, 'C. E. A.');
  text = text.replace(/\bPICE\b/g, 'P. I. C. E.');
  text = text.replace(/\bJME\b/g, 'J. M. E.');
  text = text.replace(/\bABS\b/g, 'A. B. S.');
  text = text.replace(/\bLMS\b/g, 'L. M. S.');
  text = text.replace(/\bMS Teams\b/gi, 'Microsoft Teams');
  text = text.replace(/\bCAL\b/g, 'C. A. L.');
  text = text.replace(/\bITech\b/g, 'I-Tech');
  text = text.replace(/\bREELE\b/g, 'R. E. E. L. E.');
  text = text.replace(/\bRMELE\b/g, 'R. M. E. L. E.');
  text = text.replace(/\bPRC\b/g, 'P. R. C.');
  text = text.replace(/\bDOST\s*[-–—]?\s*PAGASA\b/gi, 'D-O-S-T Pag-asa');
  text = text.replace(/\bPAGASA\b/gi, 'Pag-asa');
  text = text.replace(/\bMDRRMC\b/g, 'M. D. R. R. M. C.');
  text = text.replace(/\bMDRRMO\b/g, 'M. D. R. R. M. O.');
  text = text.replace(/\bDOST\b/g, 'D-O-S-T');
  text = text.replace(/\bCHED\b/g, 'Ched');
  text = text.replace(/\bDepEd\b/g, 'Dep-Ed');

  // 5. Mga Karaniwang Daglat at Titulo
  text = text.replace(/\bhal\.\s*/gi, 'halimbawa, ');
  text = text.replace(/\batbp\.?\b/gi, 'at iba pa');
  text = text.replace(/\bDr\.\s+/g, 'Doktor ');
  text = text.replace(/\bdr\.\s+/g, 'doktor ');
  text = text.replace(/\bG\.\s+/g, 'Ginoong ');
  text = text.replace(/\bGng\.\s+/g, 'Ginang ');
  text = text.replace(/\bBb\.\s+/g, 'Binibining ');
  text = text.replace(/\bPang\.\s+/g, 'Pangulong ');
  text = text.replace(/\bKgg\.\s+/g, 'Kagalang-galang ');
  text = text.replace(/\bSen\.\s+/g, 'Senador ');
  text = text.replace(/\bRep\.\s+/g, 'Kinatawan ');
  text = text.replace(/\bGov\.\s+/g, 'Gobernador ');
  text = text.replace(/\bSec\.\s+/g, 'Kalihim ');
  text = text.replace(/\bPres\.\s+/g, 'Presidente ');

  // 6. MAHALAGA: Ang Plural Marker na "mga"
  // Sa Tagalog ortograpiya, ang "mga" ay dinadaglat lamang ngunit ang tamang bigkas ay "mangá".
  // Kung hindi papalitan, binabaybay ito ng TTS engine bilang mga letrang "M-G-A".
  text = text.replace(/\bMga\b/g, 'Manga');
  text = text.replace(/\bmga\b/g, 'manga');
  text = text.replace(/\bMGA\b/g, 'MANGA');

  // 7. MAHALAGA: Ang Panandang "ng"
  // Ang standalone na salitang "ng" ay binibigkas na "nang".
  text = text.replace(/\bNg\b/g, 'Nang');
  text = text.replace(/\bng\b/g, 'nang');
  text = text.replace(/\bNG\b/g, 'NANG');

  // 8. Tagalog Hyphenated Words (Glottal Stop)
  // Halimbawa: "mag-aaral" -> "mag aaral", "pag-asa" -> "pag asa", "taga-Lopez" -> "taga Lopez"
  // Nagdudulot ito ng natural na pause sa halip na sabihin ng synthesizer ang "hyphen".
  text = text.replace(/([a-zA-Z\u00C0-\u024F])-([a-zA-Z\u00C0-\u024F])/g, '$1 $2');

  // 9. Kung walang katutubong boses (fallback voice tulad ng US English synthesizer),
  // lapatan ng phonetic correction ang mga mahahalagang pangalan upang hindi pumiyok
  if (tier === 'fallback') {
    text = text.replace(/\bHimaya\b/g, 'Hee-maya');
    text = text.replace(/\bhimaya\b/g, 'hee-maya');
    text = text.replace(/\bPilipinas\b/g, 'Pee-lee-pinas');
    text = text.replace(/\bPilipino\b/g, 'Pee-lee-peeno');
    text = text.replace(/\bQuezon\b/g, 'Ke-zon');
    text = text.replace(/\bLopez\b/g, 'Low-pez');
    text = text.replace(/\bIskolar\b/g, 'Is-kolar');
    text = text.replace(/\biskolar\b/g, 'is-kolar');
    text = text.replace(/\bGumaca\b/g, 'Goo-ma-ka');
    text = text.replace(/\bKatagalugan\b/g, 'Kah-tah-gah-loo-gan');
    text = text.replace(/\bkanayunan\b/g, 'kah-nah-yoo-nan');
  }

  return text;
}

/**
 * Hatiin ang teksto sa maiikling pangungusap (mga 18-26 salita bawat isa).
 * Tinitiyak nito na hindi mag-ha-hang o mag-ti-time-out ang Chromium Web Speech API.
 */
export function chunkTextForSpeech(text = '', maxWords = 24) {
  if (!text) return [];

  // Hatiin muna ayon sa bantas ng pangungusap
  const sentences = text
    .split(/(?<=[.!?;\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks = [];
  let currentWords = [];

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(Boolean);

    if (words.length > maxWords) {
      if (currentWords.length > 0) {
        chunks.push(currentWords.join(' '));
        currentWords = [];
      }
      // Hatiin ayon sa kuwit (comma) kung masyadong mahaba ang pangungusap
      const subClauses = sentence.split(/(?<=[,])\s+/);
      for (const clause of subClauses) {
        const cWords = clause.split(/\s+/).filter(Boolean);
        if (currentWords.length + cWords.length > maxWords && currentWords.length > 0) {
          chunks.push(currentWords.join(' '));
          currentWords = [];
        }
        currentWords.push(...cWords);
      }
    } else {
      if (currentWords.length + words.length > maxWords && currentWords.length > 0) {
        chunks.push(currentWords.join(' '));
        currentWords = [];
      }
      currentWords.push(...words);
    }
  }

  if (currentWords.length > 0) {
    chunks.push(currentWords.join(' '));
  }

  return chunks;
}

/**
 * Lumikha ng SpeechSynthesisUtterance na nakatono para sa Tagalog
 */
export function createTagalogUtterance(textChunk, voice = null, tier = 'fallback') {
  const utterance = new SpeechSynthesisUtterance(textChunk);

  // Itakda ang boses kung mayroon
  if (voice) {
    utterance.voice = voice;
    // Ang lang ay DAPAT tumugma sa itinakdang boses (o sa voice.lang)
    // upang maiwasan ang 'language-unavailable' rejection sa Windows SAPI at Chromium
    utterance.lang = voice.lang || 'en-US';
  } else {
    // Kung walang boses na naitakda, subukan ang fil-PH
    utterance.lang = 'fil-PH';
  }

  // Ang Tagalog ay syllable-timed; ang 0.88-0.90 rate ay nagbibigay ng malinaw na pagbigkas
  utterance.rate = 0.90;
  utterance.pitch = 1.0;

  return utterance;
}
