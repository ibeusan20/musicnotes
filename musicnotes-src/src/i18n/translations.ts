const hr = {
  documentTitle: "MusicNotes | Vježbanje nota",
  back: "← Natrag",
  subtitle: "Vježbaj prepoznavanje nota, intervala, ljestvica i modusa.",
  appTag: "Vježbanje nota",

  language: "Jezik",
  appearance: "Tema",
  themeSystem: "Sustav",
  themeLight: "Svijetla",
  themeDark: "Tamna",

  practiceLabel: "PREPOZNAJ NOTU",
  question: "Koja je ovo nota?",

  clefTreble: "Violinski ključ",
  clefBass: "Basovski ključ",
  clefAlto: "Altovski ključ",
  clefTenor: "Tenorski ključ",

  staffDescription: "Notno crtovlje. Ključ:",
  staffInstruction: "Prepoznaj notu.",

  play: "▶ Reproduciraj notu (P)",
  audioError: "Nije moguće reproducirati zvuk.",

  yourAnswer: "Tvoj odgovor",
  placeholderLetter: "Npr. C, cis ili es",
  placeholderOctave: "Npr. cis4 ili es3",
  check: "Provjeri",
  next: "Sljedeća nota",

  invalidLetter: "Upiši valjan naziv note, npr. C, cis ili es.",
  invalidOctave: "Upiši naziv i oktavu, npr. cis4 ili es3.",

  correctFeedback: "Točno!",
  incorrectFeedback: "Netočno.",
  answerIs: "Odgovor je",
  correctAnswer: "Točan odgovor:",
  waiting: "Upiši naziv note i pritisni Enter.",
  keyboardHint: "Enter — provjeri odgovor ili prijeđi na sljedeću notu.",
  notationHint: "Nazivi nota: hrvatski sustav (H, cis, es, hes...).",

  stats: "Statistika",
  session: "Trenutačna sesija",
  totalStats: "Ukupna statistika",
  correct: "Točno",
  incorrect: "Pogrešno",
  attempts: "Pokušaja",
  totalAttempts: "Ukupno",
  accuracy: "Točnost",
  streak: "Niz",
  bestStreak: "Najbolji niz",
  record: "Rekord",

  settings: "Postavke",
  clef: "Glazbeni ključ",
  clefRandom: "Nasumično (sva četiri)",
  clefTrebleBass: "Violinski i basovski",

  difficulty: "Težina",
  difficultyBasic: "Osnovna — bez pomoćnih crta",
  difficultyExtended: "Proširena — do 2 pomoćne crte",
  difficultyAdvanced: "Napredna — do 4 pomoćne crte",

  answerMode: "Način odgovaranja",
  answerLetter: "Samo naziv note",
  answerLetterOctave: "Naziv i oktava",

  accidentals: "Predznaci",
  accidentalOff: "Bez predznaka",
  accidentalSingle: "Jednostruki (♯, ♭, ♮)",
  accidentalDouble: "Svi (♯, ♭, ♮, 𝄪, 𝄫)",

  settingsHelp:
    "Promjena postavki vježbanja započinje novu sesiju. Ukupna statistika ostaje spremljena.",

  reset: "Resetiranje",
  resetSession: "Resetiraj sesiju",
  resetAll: "Obriši statistiku ovog načina",
  resetConfirm:
    "Obrisati ukupnu statistiku trenutačnog načina vježbanja? Ova radnja ne može se poništiti.",

  footer: "MusicNotes - vježbanje glazbene notacije",
  storageNotice: "Statistika se sprema lokalno.",

  practiceMode: "Način vježbanja",
  modeNotes: "Prepoznavanje nota",
  modeIntervals: "Prepoznavanje intervala",

  intervalPracticeLabel: "PREPOZNAJ INTERVAL",
  intervalQuestion: "Koji je ovo interval?",
  intervalLevel: "Skup intervala",
  intervalCommon: "Osnovni (15 intervala)",
  intervalAll: "Svi (27 intervala)",
  placeholderInterval: "Npr. č5, m3 ili pov4",
  invalidInterval: "Upiši valjanu oznaku, npr. č5, sm5 ili pov4.",
  waitingInterval: "Upiši oznaku intervala i pritisni Enter.",
  intervalHint:
    "Note čitaj slijeva nadesno. č = čista, m = mala, v = velika, sm = smanjena, pov = povećana.",
  staffInstructionInterval: "Prepoznaj interval između dviju nota.",
  legacyStats: "Ranija zajednička statistika",
  legacyStatsHelp: "Nije je moguće točno rasporediti po načinima vježbanja.",

  modeNotesShort: "Note",
  modeIntervalsShort: "Intervali",
  modeScales: "Prepoznavanje ljestvica",
  modeScalesShort: "Ljestvice",

  scalePracticeLabel: "PREPOZNAJ LJESTVICU",
  scaleQuestion: "Koja je ovo ljestvica?",
  scaleLevel: "Vrste ljestvica",
  scaleBasic: "Dur i prirodni mol",
  scaleAll: "Dur i sve tri vrste mola",

  placeholderScale: "Npr. A dur ili a harmonijski mol",
  invalidScale: "Upiši valjan naziv ljestvice i, ako je potrebno, vrstu mola.",
  waitingScale: "Odredi toniku i vrstu ljestvice pa pritisni Enter.",
  scaleHint:
    "Prirodni, harmonijski i melodijski mol razlikuju se po VI. i VII. stupnju.",
  staffInstructionScale:
    "Prepoznaj ljestvicu prema ključu, predznacima i notama.",
  nextQuestion: "Sljedeće pitanje",

  modeModes: "Prepoznavanje modusa",
  modeModesShort: "Modusi",
  modePracticeLabel: "PREPOZNAJ MODUS",
  modeQuestion: "Koji je ovo modus?",
  placeholderMode: "Npr. D dorski ili G miksolidijski",
  waitingMode: "Odredi toniku i modus pa pritisni Enter.",
  modeHint:
    "Jonski, dorski, frigijski, lidijski, miksolidijski, eolski i lokrijski modus.",
  staffInstructionMode: "Prepoznaj toniku i modus prikazane ljestvice.",

  intervalStructure: "Građa intervala",
  diatonicNumber: "dijatonski broj",
  semitones: "polutonova",
} as const;

const en: Record<keyof typeof hr, string> = {
  documentTitle: "MusicNotes | Note trainer",
  back: "← Back",
  subtitle: "Practise recognizing notes, intervals, scales and modes.",
  appTag: "Music note trainer",

  language: "Language",
  appearance: "Theme",
  themeSystem: "System",
  themeLight: "Light",
  themeDark: "Dark",

  practiceLabel: "IDENTIFY THE NOTE",
  question: "Which note is this?",

  clefTreble: "Treble clef",
  clefBass: "Bass clef",
  clefAlto: "Alto clef",
  clefTenor: "Tenor clef",

  staffDescription: "Music staff. Clef:",
  staffInstruction: "Identify the note.",

  play: "▶ Play note (P)",
  audioError: "Unable to play the note.",

  yourAnswer: "Your answer",
  placeholderLetter: "E.g. C, cis or es",
  placeholderOctave: "E.g. cis4 or es3",
  check: "Check",
  next: "Next note",

  invalidLetter: "Enter a valid note name, e.g. C, cis or es.",
  invalidOctave: "Enter a note name and octave, e.g. cis4 or es3.",

  correctFeedback: "Correct!",
  incorrectFeedback: "Incorrect.",
  answerIs: "The answer is",
  correctAnswer: "Correct answer:",
  waiting: "Type the note name and press Enter.",
  keyboardHint: "Enter — check your answer or move to the next note.",
  notationHint: "Note names use Croatian notation (H, cis, es, hes...).",

  stats: "Statistics",
  session: "Current session",
  totalStats: "All-time statistics",
  correct: "Correct",
  incorrect: "Incorrect",
  attempts: "Attempts",
  totalAttempts: "Total",
  accuracy: "Accuracy",
  streak: "Streak",
  bestStreak: "Best streak",
  record: "Record",

  settings: "Settings",
  clef: "Clef",
  clefRandom: "Random (all four)",
  clefTrebleBass: "Treble and bass",

  difficulty: "Difficulty",
  difficultyBasic: "Basic — no ledger lines",
  difficultyExtended: "Extended — up to 2 ledger lines",
  difficultyAdvanced: "Advanced — up to 4 ledger lines",

  answerMode: "Answer mode",
  answerLetter: "Note name only",
  answerLetterOctave: "Note name and octave",

  accidentals: "Accidentals",
  accidentalOff: "No accidentals",
  accidentalSingle: "Single (♯, ♭, ♮)",
  accidentalDouble: "All (♯, ♭, ♮, 𝄪, 𝄫)",

  settingsHelp:
    "Changing practice settings starts a new session. All-time statistics are kept.",

  reset: "Reset",
  resetSession: "Reset session",
  resetAll: "Clear this mode's statistics",
  resetConfirm:
    "Clear the all-time statistics for the current practice mode? This action cannot be undone.",

  footer: "MusicNotes — music notation practice",
  storageNotice: "Statistics are stored in this browser.",

  practiceMode: "Practice mode",
  modeNotes: "Note recognition",
  modeIntervals: "Interval recognition",

  intervalPracticeLabel: "IDENTIFY THE INTERVAL",
  intervalQuestion: "Which interval is this?",
  intervalLevel: "Interval set",
  intervalCommon: "Common (15 intervals)",
  intervalAll: "All (27 intervals)",
  placeholderInterval: "E.g. č5, m3 or pov4",
  invalidInterval: "Enter a valid interval code, e.g. č5, sm5 or pov4.",
  waitingInterval: "Enter the interval code and press Enter.",
  intervalHint:
    "Read notes from left to right. č = perfect, m = minor, v = major, sm = diminished, pov = augmented.",
  staffInstructionInterval: "Identify the interval between the two notes.",
  legacyStats: "Previous shared statistics",
  legacyStatsHelp:
    "These results cannot be reliably assigned to individual practice modes.",

  modeNotesShort: "Notes",
  modeIntervalsShort: "Intervals",
  modeScales: "Scale recognition",
  modeScalesShort: "Scales",

  scalePracticeLabel: "IDENTIFY THE SCALE",
  scaleQuestion: "Which scale is this?",
  scaleLevel: "Scale types",
  scaleBasic: "Major and natural minor",
  scaleAll: "Major and all three minor forms",

  placeholderScale: "E.g. A dur or a harmonijski mol",
  invalidScale: "Enter a valid scale name and, when required, the minor form.",
  waitingScale: "Identify the tonic and scale type, then press Enter.",
  scaleHint:
    "Natural, harmonic and melodic minor differ in their sixth and seventh degrees.",
  staffInstructionScale:
    "Identify the scale from the clef, key signature and notes.",
  nextQuestion: "Next question",

  modeModes: "Mode recognition",
  modeModesShort: "Modes",
  modePracticeLabel: "IDENTIFY THE MODE",
  modeQuestion: "Which mode is this?",
  placeholderMode: "E.g. D dorski or G miksolidijski",
  waitingMode: "Identify the tonic and mode, then press Enter.",
  modeHint:
    "Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian and Locrian.",
  staffInstructionMode: "Identify the tonic and mode of the written scale.",

  intervalStructure: "Interval structure",
  diatonicNumber: "diatonic number",
  semitones: "semitones",
};

export type Language = "hr" | "en";
export type TranslationKey = keyof typeof hr;
export type Translate = (key: TranslationKey) => string;
export const translations = { hr, en };
