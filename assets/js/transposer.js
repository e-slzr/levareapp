/* ==========================================================================
   WorshipApp — MUSICAL CHORD TRANSPOSER ENGINE
   ========================================================================== */

const SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'F#': 'F#', 'C#': 'C#' };

function transposeChord(chord, semitones) {
    if (semitones === 0) return chord;
    
    // Slash Chord handling (e.g., G/B or D/F#)
    if (chord.includes('/')) {
        return chord.split('/').map(part => transposeSingleChord(part, semitones)).join('/');
    }
    return transposeSingleChord(chord, semitones);
}

function transposeSingleChord(chord, semitones) {
    // Regex matching root notes (A-G with flats/sharps)
    // Group 1: Root Note, Group 2: The rest of the chord suffix (m7, maj7, add9, etc.)
    const chordRegex = /^([A-G][#b]?)(.*)$/;
    const match = chord.match(chordRegex);
    
    if (!match) return chord; // fallback if not matchable
    
    let root = match[1];
    const suffix = match[2];
    
    // Normalize flats to sharps
    if (FLATS[root]) {
        root = FLATS[root];
    } else if (root.endsWith('b')) {
        // Handle generic flats by going back a step in scale
        const letter = root.charAt(0);
        let index = SCALE.indexOf(letter);
        if (index !== -1) {
            index = (index - 1 + 12) % 12;
            root = SCALE[index];
        }
    }
    
    let index = SCALE.indexOf(root);
    if (index === -1) return chord;
    
    // Transpose
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    
    return SCALE[newIndex] + suffix;
}

// Parses ChordPro brackets [C] and returns stacked blocks of Chords over Lyrics
function parseChordsToHTML(text, semitones = 0) {
    if (!text) return '';
    
    const lines = text.split('\n');
    let html = '';

    lines.forEach(line => {
        const trimmed = line.trim();
        
        // 1. Empty lines
        if (trimmed === '') {
            html += '<div class="lyrics-empty-line"></div>';
            return;
        }

        // 2. Section Headers (e.g., [Intro], [Verso 1], [Coro])
        const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            const sectionName = sectionMatch[1];
            const isCommonSection = /^(intro|verso|coro|puente|bridge|outro|pre-coro|precoro|solo|interludio|instrumental|chorus|verse|ending|coda)/i.test(sectionName) || sectionName.length > 3;
            if (isCommonSection) {
                let badgeClass = 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border-zinc-500/20';
                let dotColor = '#71717a';

                if (typeof window !== 'undefined' && typeof window.getSectionTheme === 'function') {
                    const theme = window.getSectionTheme(sectionName);
                    if (theme) {
                        badgeClass = theme.badgeBg;
                        dotColor = theme.dotColor;
                    }
                } else if (typeof getSectionTheme === 'function') {
                    const theme = getSectionTheme(sectionName);
                    if (theme) {
                        badgeClass = theme.badgeBg;
                        dotColor = theme.dotColor;
                    }
                }

                html += `<div class="lyrics-section-header-wrap">
                    <span class="lyrics-section-pill ${badgeClass}">
                        <span class="section-pill-dot" style="background-color: ${dotColor};"></span>
                        <span>${escapeHtml(sectionName)}</span>
                    </span>
                </div>`;
                return;
            }
        }

        // 3. Instrumental Lines (starts with #)
        if (line.startsWith('#')) {
            const content = line.substring(1); // Remove the '#' prefix
            const parsedInstrumental = content.replace(/\[([^\]]+)\]/g, (match, chordName) => {
                const transposed = transposeChord(chordName, semitones);
                return `<span class="instrumental-viewer-badge">${escapeHtml(transposed)}</span>`;
            });
            html += `<div class="lyrics-line instrumental-line">${parsedInstrumental}</div>`;
            return;
        }

        // 4. Normal line parsing (splitting by chords brackets)
        const parts = line.split(/(\[[^\]]+\])/g);
        let lineHtml = '<div class="lyrics-line">';
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;

            if (part.startsWith('[') && part.endsWith(']')) {
                const chordName = part.slice(1, -1);
                const transposedChord = transposeChord(chordName, semitones);
                
                // Fetch the corresponding lyric text block for this chord
                let nextText = '';
                if (i + 1 < parts.length && !parts[i + 1].startsWith('[')) {
                    nextText = parts[i + 1];
                    i++;
                }

                lineHtml += `<span class="chord-segment">` +
                            `<span class="chord-el">${escapeHtml(transposedChord)}</span>` +
                            `<span class="lyric-el">${escapeHtml(nextText) || ' '}</span>` +
                            `</span>`;
            } else {
                // Text before any chords in the current line
                lineHtml += `<span class="chord-segment">` +
                            `<span class="chord-el empty-chord"></span>` +
                            `<span class="lyric-el">${escapeHtml(part)}</span>` +
                            `</span>`;
            }
        }
        
        lineHtml += '</div>';
        html += lineHtml;
    });

    return html;
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Global browser export
if (typeof window !== 'undefined') {
    window.transposeChord = transposeChord;
    window.parseChordsToHTML = parseChordsToHTML;
}
