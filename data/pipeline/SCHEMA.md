# Pipeline data schema (v1)

All processed datasets live under `data/pipeline/processed/`. Every record
carries `source` + `license`; nothing is ever mixed without metadata.

## words/`<letter>.json` — array of word records

| Field | Type | Notes |
|---|---|---|
| `id` | string | `{lemma}:{pos}`, unique. pos ∈ n/v/a/r (`s` folded to `a`) |
| `word` | string | Display form (original case) |
| `lemma` | string | Lowercased lookup form |
| `pronunciation` | string \| null | IPA from WordNet entry data when present (first value); null otherwise. Numbered homograph variants (`n-1`, `n-2`) merge into one record |
| `partOfSpeech` | string | n/v/a/r |
| `definitions` | [{text, synsetId, example?}] | From WordNet synsets, max 8 |
| `synonyms` | string[] | Co-members of the word's synsets, max 20 |
| `antonyms` | string[] | Sense-level antonym refs resolved to lemmas, max 12 |
| `hypernyms` / `hyponyms` | string[] | Via synset map (hyponyms = inverted hypernyms), max 12 each |
| `relatedWords` | string[] | derivation + pertainym refs, max 12 |
| `cefrLevel` | A1–C2 \| null | Joined from CEFR-J on `(lemma, pos)`; null = source silent, never guessed |
| `cefrSource` | "cefr-j" \| null | Present exactly when `cefrLevel` is set |
| `source` / `license` | string | `"wordnet"` / `"CC-BY-4.0"` |
| `translation` | null | Stage is separate; always null at import |
| `translationSource` | null | Set only by the translation stage |
| `translationStatus` | `"pending"` | `pending` → `translated` → `reviewed` |

## sentences/shard_*.json — array of sentence records

| Field | Notes |
|---|---|
| `id` | `tatoeba:{en_id}-{ar_id}`, unique |
| `english` / `arabic` | Verbatim source texts (never edited) |
| `cefrLevel` / `grammarTopic` | null (never guessed) |
| `source` / `license` | `"tatoeba"` / `"CC-BY-2.0-FR"` |
| `translation` / `translationSource` | Arabic text / `"tatoeba"` |
| `translationStatus` | `"translated"` |

## grammar/grammar.json — array of grammar records

Derived from the CEFR-J Grammar Profile: `topic` (grammatical item),
`cefrLevel` (A1.1 → A1), `sentenceType`/`shorthand` kept as metadata.
`enrich_grammar.py` adds curated Arabic `explanation` texts (grammar-family
templates written for Arab learners) and up to 3 real Tatoeba `examples`
(matched by grammar-tag, then topic keywords, same-or-lower CEFR only —
never invented). `translationStatus` stays `"pending"` until reviewed.

## Translation lifecycle (separate stage, not part of ingestion)

1. Ingestion writes English data with `translationStatus: "pending"`.
2. `translate_words.py` builds `meta/word_translations.json`: a lemma-level
   overlay from the FreeDict eng-ara dictionary (Arabeyes wordlist, GPL).
   The source has no POS info, so one lemma map applies to every POS
   variant of that lemma — documented here, not hidden.
3. `translate_wiktionary.py` builds `meta/word_translations_wikt.json`
   (CC-BY-SA) — applied only where FreeDict missed.
4. `meta/word_translations_curated.json` holds hand/AI-curated translations
   (currently the CEFR gap words) — applied last, only where still pending.
   Priority: freedict > wiktionary > curated; English fields never modified.
5. A reviewer flips `"translated"` → `"reviewed"`.

## Final curriculum (`final/words.json`, `final/sentences.json`)

`curate_final.py` selects exactly 2000 words + 2000 sentences by
teacher-ranking (frequency in our own sentence corpus, CEFR relevance,
definition/example quality), never by padding:
- Words: translated + CEFR-leveled records only; CEFR-J levels used
  directly, never guessed; categories from WordNet lexicographer files with
  a documented keyword-override table; hand-written app terms included
  first (definitions filled from WordNet where the lemma exists).
- Sentences: natural Tatoeba pairs (3–25 words, no proper names);
  rule-based CEFR classification + keyword categories + grammar-pattern
  tags (all deterministic and documented in code); shortfalls at B2–C2
  reported honestly with true labels kept (see `curation_report.json`).
- `validate_final.py` enforces exactly 2000/2000, all required fields,
  unique ids and no near-duplicates.

## Idempotency

Re-running any step rewrites its outputs from scratch; dedup keys are
`(lemma, pos)` for words and normalized `(english, arabic)` pairs for
sentences. External source IDs (`tatoeba:*`, synset IDs, `cefrj:*`) are
preserved on every record.
