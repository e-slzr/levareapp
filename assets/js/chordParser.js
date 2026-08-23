/* ==========================================================================
   Levare — CHORD & SECTION PARSER ENGINE (Dual Format & Visual Badges)
   ========================================================================== */

const CHORD_REGEX = /^[A-G][#b]?(m|maj|min|dim|aug|sus[24]?|add[29]?|[0-9]+)*(\/[A-G][#b]?)?$/;
const CHORD_TOKEN_REGEX = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[29]?|[0-9]+)*(?:\/[A-G][#b]?)?)\b/g;

/**
 * Normaliza el formato de un acorde:
 * Letra base en mayúscula, alteración (#/b), sufijo 'm' en minúscula y resto estándar.
 * Ejemplos: "cm" -> "Cm", "F#M7" -> "F#m7", "c#maj7" -> "C#maj7", "g/b" -> "G/B"
 */
function formatMusicalChord(chord) {
    if (!chord) return '';
    chord = chord.trim();
    if (chord.length === 0) return '';

    // Manejo de acordes con bajo (slash chords, ej. D/F#)
    if (chord.includes('/')) {
        return chord.split('/').map(part => formatSingleChord(part)).join('/');
    }
    return formatSingleChord(chord);
}

function formatSingleChord(chord) {
    if (!chord) return '';
    chord = chord.trim();

    const match = chord.match(/^([A-G])([#b]?)(.*)$/i);
    if (!match) return chord;

    const root = match[1].toUpperCase();
    let accidental = match[2] ? (match[2] === '#' ? '#' : 'b') : '';
    let suffix = match[3] || '';

    // Normalizar 'm' minúscula para menores
    if (suffix.startsWith('m') && !suffix.startsWith('maj') && !suffix.startsWith('min')) {
        suffix = 'm' + suffix.substring(1);
    } else if (suffix.startsWith('M') && !suffix.startsWith('MAJ') && !suffix.startsWith('Maj') && suffix.length === 1) {
        suffix = ''; // "CM" es C mayor
    } else if (suffix.toLowerCase().startsWith('maj')) {
        suffix = 'maj' + suffix.substring(3);
    } else if (suffix.toLowerCase().startsWith('dim')) {
        suffix = 'dim' + suffix.substring(3);
    } else if (suffix.toLowerCase().startsWith('aug')) {
        suffix = 'aug' + suffix.substring(3);
    } else if (suffix.toLowerCase().startsWith('sus')) {
        suffix = 'sus' + suffix.substring(3);
    } else if (suffix.toLowerCase().startsWith('add')) {
        suffix = 'add' + suffix.substring(3);
    }

    return root + accidental + suffix;
}

/**
 * Normaliza nombres de secciones a MAYÚSCULAS estándar.
 * Ej: "intro" -> "INTRO", "verso 2" -> "VERSO 2", "puente" -> "PUENTE"
 */
function formatSectionHeader(name) {
    if (!name) return '';
    let clean = name.replace(/[\[\]:]/g, '').trim().toUpperCase();
    
    if (clean.startsWith('PRECORO') || clean.startsWith('PRE CORO') || clean.startsWith('PRE-CORO')) {
        clean = 'PRE-CORO';
    } else if (clean.startsWith('CHORUS')) {
        clean = clean.replace('CHORUS', 'CORO');
    } else if (clean.startsWith('VERSE')) {
        clean = clean.replace('VERSE', 'VERSO');
    } else if (clean.startsWith('BRIDGE')) {
        clean = clean.replace('BRIDGE', 'PUENTE');
    } else if (clean.startsWith('ENDING') || clean.startsWith('FINAL')) {
        clean = 'OUTRO';
    }

    return clean;
}

/**
 * Determina si una línea está compuesta predominantemente por acordes musicales.
 */
function isChordLine(line) {
    if (!line) return false;
    const trimmed = line.trim();
    if (!trimmed) return false;

    // Tokens sin símbolos comunes de repetición
    const tokens = trimmed.split(/\s+/).filter(t => !/^(x\d+|\/\/?|\(|\)|\||:)$/i.test(t));
    if (tokens.length === 0) return false;

    let chordCount = 0;
    tokens.forEach(token => {
        const cleanToken = token.replace(/[\(\),]/g, '');
        if (CHORD_REGEX.test(cleanToken)) {
            chordCount++;
        }
    });

    return (chordCount / tokens.length) >= 0.65;
}

/**
 * Detecta si una línea define un encabezado de sección (ej. "Intro:", "[Coro]", "Puente:", "Solo: G A Bm")
 */
function detectSectionHeader(line) {
    if (!line) return null;
    const trimmed = line.trim();
    
    const sectionKeywords = [
        'INTRO', 'VERSO', 'CORO', 'PRE-CORO', 'PRECORO', 'PUENTE', 'BRIDGE', 
        'SOLO', 'OUTRO', 'INTERLUDIO', 'INSTRUMENTAL', 'CHORUS', 'VERSE', 'FINAL', 'CODA'
    ];

    // Caso 1: Entre corchetes [INTRO], [VERSO 1]
    const bracketMatch = trimmed.match(/^\[([^\]]+)\](.*)$/);
    if (bracketMatch) {
        const header = formatSectionHeader(bracketMatch[1]);
        return { header, inlineContent: bracketMatch[2].trim() };
    }

    // Caso 2: Palabra clave al inicio, seguida de ":" o acordes (ej. "Intro:", "Solo: G A Bm", "Puente:")
    const regex = new RegExp(`^(\\/\\/\\s*)?(${sectionKeywords.join('|')})(\\s*\\d*)?\\s*(:|-)?(.*)$`, 'i');
    const match = trimmed.match(regex);
    if (match) {
        let sectionName = match[2].toUpperCase();
        if (match[3]) sectionName += ' ' + match[3].trim();
        const header = formatSectionHeader(sectionName);
        const rest = (match[5] || '').trim();
        return { header, inlineContent: rest };
    }

    return null;
}

/**
 * Convierte texto pegado desde internet (formato de 2 líneas: línea de acordes sobre letra)
 * al formato estándar de Levare (ChordPro con secciones en [MAYÚSCULAS] e instrumentales #[Acordes]).
 */
function parseInternetLyricsToChordPro(rawText) {
    if (!rawText) return '';

    const lines = rawText.split(/\r?\n/);
    const outputLines = [];
    let verseCounter = 1;

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        // 1. Líneas vacías
        if (trimmed === '') {
            outputLines.push('');
            continue;
        }

        // 2. Detección de encabezados de sección
        const section = detectSectionHeader(rawLine);
        if (section) {
            let secHeader = section.header;
            if (secHeader === 'VERSO') {
                secHeader = `VERSO ${verseCounter++}`;
            }

            outputLines.push(`[${secHeader}]`);

            // Si trae acordes o contenido en la misma línea (ej. "Intro Bm A F#m G x2")
            if (section.inlineContent) {
                if (isChordLine(section.inlineContent)) {
                    // Extraer los acordes y formatearlos con corchetes
                    const formattedChords = extractAndFormatChords(section.inlineContent);
                    outputLines.push(`#${formattedChords}`);
                } else {
                    outputLines.push(section.inlineContent);
                }
            }
            continue;
        }

        // 3. Línea instrumental explícita o prefijada con '#'
        if (rawLine.startsWith('#')) {
            outputLines.push(rawLine);
            continue;
        }

        // 4. Detección de Línea de Acordes vs Línea de Letra
        if (isChordLine(rawLine)) {
            const nextLine = (i + 1 < lines.length) ? lines[i + 1] : null;
            const nextTrimmed = nextLine ? nextLine.trim() : '';
            const nextIsSection = nextLine ? detectSectionHeader(nextLine) : false;
            const nextIsChords = nextLine ? isChordLine(nextLine) : false;

            // Si la siguiente línea es letra real (no vacía, no es sección, no es otra línea de acordes)
            if (nextLine !== null && nextTrimmed !== '' && !nextIsSection && !nextIsChords) {
                // Fusión de Acordes en la Letra por posición de columna horizontal
                const mergedLine = mergeChordsIntoLyrics(rawLine, nextLine);
                outputLines.push(mergedLine);
                i++; // Saltar la línea de letra ya fusionada
            } else {
                // Es una línea instrumental de solo acordes
                const formattedChords = extractAndFormatChords(rawLine);
                outputLines.push(`#${formattedChords}`);
            }
            continue;
        }

        // 5. Línea de letra normal (sin línea de acordes encima)
        outputLines.push(rawLine);
    }

    return outputLines.join('\n');
}

/**
 * Fusiona una línea de acordes sobre una línea de letra usando los índices de columna horizontal.
 */
function mergeChordsIntoLyrics(chordLine, lyricLine) {
    // Encontrar todos los acordes y sus posiciones de inicio (colIndex)
    const chordMatches = [];
    let match;
    const regex = new RegExp(CHORD_TOKEN_REGEX);

    while ((match = regex.exec(chordLine)) !== null) {
        chordMatches.push({
            chord: formatMusicalChord(match[1]),
            index: match.index
        });
    }

    if (chordMatches.length === 0) {
        return lyricLine;
    }

    // Insertar de derecha a izquierda para no alterar los índices previos
    chordMatches.sort((a, b) => b.index - a.index);

    let result = lyricLine;
    chordMatches.forEach(({ chord, index }) => {
        const chordBracket = `[${chord}]`;
        if (index >= result.length) {
            // Si el acorde está más allá del final de la letra, rellenar y anexar
            result = result + ' '.repeat(Math.max(0, index - result.length)) + chordBracket;
        } else {
            result = result.slice(0, index) + chordBracket + result.slice(index);
        }
    });

    return result;
}

/**
 * Formatea una línea de acordes planos a formato de corchetes con '#' (ej. "Bm A F#m" -> "[Bm] [A] [F#m]")
 */
function extractAndFormatChords(text) {
    if (!text) return '';
    return text.replace(CHORD_TOKEN_REGEX, (m, chord) => `[${formatMusicalChord(chord)}]`);
}

/**
 * Calcula el número del siguiente verso basándose en el texto actual.
 */
function getNextVerseNumber(currentText) {
    if (!currentText) return 1;
    const matches = currentText.match(/\[VERSO\s*(\d*)\]/gi);
    if (!matches) return 1;
    
    let max = 0;
    matches.forEach(m => {
        const numMatch = m.match(/\d+/);
        const n = numMatch ? parseInt(numMatch[0]) : 1;
        if (n > max) max = n;
    });

    return max + 1;
}

function chordProToEditorHTML(chordProText) {
    if (!chordProText) return '';

    // Auto-detectar si el texto no tiene corchetes pero contiene acordes o secciones (formato internet)
    if (!chordProText.includes('[') && (isChordLine(chordProText) || detectSectionHeader(chordProText))) {
        chordProText = parseInternetLyricsToChordPro(chordProText);
    }

    const lines = chordProText.split('\n');
    let html = '';

    lines.forEach(line => {
        const trimmed = line.trim();

        // 1. Línea vacía
        if (trimmed === '') {
            html += '<div class="editor-line"><br></div>';
            return;
        }

        // 2. Encabezado de sección [INTRO], [VERSO 1], etc.
        const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            const secName = formatSectionHeader(sectionMatch[1]);
            html += `<div class="editor-line editor-section-row" data-section="${secName}">` +
                    `<span class="editor-section-badge" contenteditable="false">[${secName}]</span>` +
                    `</div>`;
            return;
        }

        // 3. Línea instrumental #[Bm] [A]
        if (line.startsWith('#')) {
            const content = line.substring(1);
            const parsedContent = content.replace(/\[([^\]]+)\]/g, (match, chord) => {
                const formatted = formatMusicalChord(chord);
                return `<span class="chord-badge" contenteditable="false" draggable="true" data-chord="${formatted}">${formatted}</span>`;
            });
            html += `<div class="editor-line editor-instrumental-row">` +
                    `<span class="instrumental-prefix" contenteditable="false">#</span>${parsedContent}` +
                    `</div>`;
            return;
        }

        // 4. Línea normal con acordes intercalados
        const parts = line.split(/(\[[^\]]+\])/g);
        let lineHtml = '<div class="editor-line">';
        
        parts.forEach(part => {
            if (!part) return;
            if (part.startsWith('[') && part.endsWith(']')) {
                const chordName = formatMusicalChord(part.slice(1, -1));
                lineHtml += `<span class="chord-badge" contenteditable="false" draggable="true" data-chord="${chordName}">${chordName}</span>`;
            } else {
                lineHtml += escapeHtmlText(part);
            }
        });

        lineHtml += '</div>';
        html += lineHtml;
    });

    return html;
}

/**
 * Convierte los nodos DOM del Constructor Visual de vuelta a texto plano ChordPro estándar.
 */
function editorHTMLToChordPro(editorEl) {
    if (!editorEl) return '';
    const lines = [];
    
    // Obtener únicamente elementos hijos directos de nivel superior
    const directChildren = Array.from(editorEl.children);

    if (directChildren.length === 0) {
        return parseRawEditorText(editorEl);
    }

    directChildren.forEach(lineEl => {
        // 1. Si es una sección (o contiene el badge de sección)
        const sectionBadge = lineEl.querySelector('.editor-section-badge');
        if (sectionBadge) {
            const secText = sectionBadge.textContent.trim();
            lines.push(secText);
            return;
        }

        // 2. Si es una línea instrumental
        const isInstrumental = lineEl.classList.contains('editor-instrumental-row') || lineEl.querySelector('.instrumental-prefix');
        let lineStr = isInstrumental ? '#' : '';

        // Recorrer nodos hijos directos de la línea
        lineEl.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                lineStr += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList.contains('chord-badge')) {
                    const chord = node.getAttribute('data-chord') || node.textContent.trim();
                    lineStr += `[${chord}]`;
                } else if (node.classList.contains('instrumental-prefix') || node.classList.contains('editor-section-badge')) {
                    // Ya procesados
                } else if (node.tagName === 'BR') {
                    // Salto de línea
                } else {
                    lineStr += node.textContent;
                }
            }
        });

        lines.push(lineStr);
    });

    return lines.join('\n');
}

function parseRawEditorText(el) {
    let text = '';
    el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList.contains('chord-badge')) {
                text += `[${node.getAttribute('data-chord') || node.textContent.trim()}]`;
            } else if (node.classList.contains('editor-section-badge')) {
                text += `\n${node.textContent.trim()}\n`;
            } else {
                text += node.innerText;
            }
        }
    });
    return text;
}

function escapeHtmlText(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * Retorna el tema visual (colores y clases) según el tipo de sección.
 */
function getSectionTheme(sectionType) {
    const clean = (sectionType || '').toUpperCase();
    if (clean.includes('PRE-CORO') || clean.includes('PRECORO') || clean.includes('PRE-CHORUS')) {
        return {
            name: 'PRE-CORO',
            headerColor: 'text-amber-500 dark:text-amber-400',
            badgeBg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20',
            borderColor: 'border-amber-500/30 dark:border-amber-500/20',
            dotColor: '#f59e0b'
        };
    }
    if (clean.includes('CORO') || clean.includes('CHORUS')) {
        return {
            name: 'CORO',
            headerColor: 'text-rose-500 dark:text-rose-400',
            badgeBg: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20',
            borderColor: 'border-rose-500/30 dark:border-rose-500/20',
            dotColor: '#f43f5e'
        };
    }
    if (clean.includes('VERSO') || clean.includes('VERSE')) {
        return {
            name: 'VERSO',
            headerColor: 'text-blue-500 dark:text-blue-400',
            badgeBg: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20',
            borderColor: 'border-blue-500/30 dark:border-blue-500/20',
            dotColor: '#3b82f6'
        };
    }
    if (clean.includes('INTRO')) {
        return {
            name: 'INTRO',
            headerColor: 'text-purple-500 dark:text-purple-400',
            badgeBg: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20',
            borderColor: 'border-purple-500/30 dark:border-purple-500/20',
            dotColor: '#a855f7'
        };
    }
    if (clean.includes('OUTRO') || clean.includes('FINAL') || clean.includes('CODA') || clean.includes('ENDING')) {
        return {
            name: 'OUTRO',
            headerColor: 'text-purple-500 dark:text-purple-400',
            badgeBg: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20',
            borderColor: 'border-purple-500/30 dark:border-purple-500/20',
            dotColor: '#a855f7'
        };
    }
    if (clean.includes('PUENTE') || clean.includes('BRIDGE')) {
        return {
            name: 'PUENTE',
            headerColor: 'text-amber-500 dark:text-amber-400',
            badgeBg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20',
            borderColor: 'border-amber-500/30 dark:border-amber-500/20',
            dotColor: '#f59e0b'
        };
    }
    if (clean.includes('SOLO') || clean.includes('INTERLUDIO') || clean.includes('INSTRUMENTAL')) {
        return {
            name: clean.includes('SOLO') ? 'SOLO' : (clean.includes('INTERLUDIO') ? 'INTERLUDIO' : 'INSTRUMENTAL'),
            headerColor: 'text-emerald-500 dark:text-emerald-400',
            badgeBg: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
            borderColor: 'border-emerald-500/30 dark:border-emerald-500/20',
            dotColor: '#10b981'
        };
    }
    return {
        name: 'SECCIÓN',
        headerColor: 'text-zinc-500 dark:text-zinc-400',
        badgeBg: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border-zinc-500/20',
        borderColor: 'border-zinc-300 dark:border-zinc-700',
        dotColor: '#71717a'
    };
}

/**
 * Determina si un tipo de sección es instrumental por defecto.
 */
function isInstrumentalSectionType(type) {
    const clean = (type || '').toUpperCase();
    return /^(INTRO|SOLO|INTERLUDIO|INSTRUMENTAL|OUTRO)/i.test(clean);
}

/**
 * Convierte texto plano ChordPro en un array de objetos de sección estructurados.
 */
function chordProToSections(chordProText) {
    if (!chordProText) return [];

    // Si viene en formato 2 líneas de internet, convertir primero a ChordPro
    if (!chordProText.includes('[') && (isChordLine(chordProText) || detectSectionHeader(chordProText))) {
        chordProText = parseInternetLyricsToChordPro(chordProText);
    }

    const lines = chordProText.split(/\r?\n/);
    const sections = [];
    let currentSection = null;

    const finalizeSection = () => {
        if (!currentSection) return;

        // Determinar si es instrumental:
        // 1. Si todas las líneas no vacías son instrumentales (#) o no tiene líneas de texto y su tipo es instrumental
        const nonEmptyLines = currentSection.lines.filter(l => l.trim() !== '');
        const allInstrumentalLines = nonEmptyLines.length > 0 && nonEmptyLines.every(l => l.trim().startsWith('#'));

        if (allInstrumentalLines || (nonEmptyLines.length === 0 && isInstrumentalSectionType(currentSection.type))) {
            currentSection.isInstrumental = true;
            // Extraer acordes de las líneas instrumentales
            const chords = [];
            currentSection.lines.forEach(line => {
                const matches = line.match(/\[([^\]]+)\]/g);
                if (matches) {
                    matches.forEach(m => {
                        const c = formatMusicalChord(m.slice(1, -1));
                        if (c) chords.push(c);
                    });
                }
            });
            currentSection.chords = chords;
            currentSection.lines = [];
        } else {
            currentSection.isInstrumental = false;
            currentSection.chords = [];
        }

        sections.push(currentSection);
    };

    lines.forEach(line => {
        const trimmed = line.trim();

        // Detección de encabezado de sección [INTRO], [VERSO 1], etc.
        const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            const secName = formatSectionHeader(sectionMatch[1]);
            const isCommonSection = /^(intro|verso|coro|puente|bridge|outro|pre-coro|precoro|solo|interludio|instrumental|chorus|verse|ending|coda)/i.test(secName) || secName.length > 3;

            if (isCommonSection) {
                finalizeSection();
                currentSection = {
                    id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                    type: secName,
                    isInstrumental: isInstrumentalSectionType(secName),
                    chords: [],
                    lines: []
                };
                return;
            }
        }

        // Si no hay sección activa, crear una por defecto
        if (!currentSection) {
            const defaultType = line.startsWith('#') ? 'INTRO' : 'VERSO 1';
            currentSection = {
                id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                type: defaultType,
                isInstrumental: isInstrumentalSectionType(defaultType),
                chords: [],
                lines: []
            };
        }

        currentSection.lines.push(line);
    });

    finalizeSection();

    // Si aún está vacío, devolver una sección por defecto
    if (sections.length === 0) {
        sections.push({
            id: 'sec_' + Date.now() + '_init',
            type: 'VERSO 1',
            isInstrumental: false,
            chords: [],
            lines: ['']
        });
    }

    return sections;
}

/**
 * Convierte un array de objetos de sección de vuelta a texto plano ChordPro estándar.
 */
function sectionsToChordPro(sections) {
    if (!Array.isArray(sections) || sections.length === 0) return '';
    const result = [];

    sections.forEach((sec, idx) => {
        const type = formatSectionHeader(sec.type || 'VERSO');
        result.push(`[${type}]`);

        if (sec.isInstrumental) {
            if (Array.isArray(sec.chords) && sec.chords.length > 0) {
                const formattedChords = sec.chords.map(c => `[${formatMusicalChord(c)}]`).join(' ');
                result.push(`#${formattedChords}`);
            }
        } else {
            if (Array.isArray(sec.lines)) {
                sec.lines.forEach(l => result.push(l));
            } else if (typeof sec.content === 'string') {
                result.push(sec.content);
            }
        }

        // Salto de separación entre secciones excepto en la última
        if (idx < sections.length - 1) {
            result.push('');
        }
    });

    return result.join('\n').trim();
}

/**
 * Parsea una línea en formato ChordPro y extrae el texto plano limpio y los acordes con sus offsets de caracteres exactos.
 * Ejemplo: "[C]Cambiaré [F]mi tristeza" -> { text: "Cambiaré mi tristeza", chords: [{ chord: "C", offset: 0 }, { chord: "F", offset: 9 }] }
 */
function parseLineChordPro(lineStr) {
    if (!lineStr) return { text: '', chords: [] };

    let text = '';
    const chords = [];
    const parts = lineStr.split(/(\[[^\]]+\])/g);

    parts.forEach(part => {
        if (!part) return;
        if (part.startsWith('[') && part.endsWith(']')) {
            const chord = formatMusicalChord(part.slice(1, -1));
            if (chord) {
                chords.push({
                    chord: chord,
                    offset: text.length
                });
            }
        } else {
            text += part;
        }
    });

    return { text, chords };
}

/**
 * Reconstruye una línea ChordPro a partir de texto plano y un arreglo de acordes con sus offsets.
 */
function formatLineChordPro(text, chords) {
    if (!Array.isArray(chords) || chords.length === 0) {
        return text || '';
    }

    // Ordenar de mayor a menor offset para insertar sin desplazar índices
    const sorted = [...chords].sort((a, b) => b.offset - a.offset);
    let result = text || '';

    sorted.forEach(({ chord, offset }) => {
        const chordBracket = `[${formatMusicalChord(chord)}]`;
        const off = Math.max(0, parseInt(offset) || 0);

        if (off >= result.length) {
            result = result + ' '.repeat(off - result.length) + chordBracket;
        } else {
            result = result.slice(0, off) + chordBracket + result.slice(off);
        }
    });

    return result;
}

// Exportación global para navegadores
window.formatMusicalChord = formatMusicalChord;
function getNextVerseNumberGlobal(text) { return getNextVerseNumber(text); }
window.formatSectionHeader = formatSectionHeader;
window.isChordLine = isChordLine;
window.detectSectionHeader = detectSectionHeader;
window.parseInternetLyricsToChordPro = parseInternetLyricsToChordPro;
window.getNextVerseNumber = getNextVerseNumber;
window.chordProToEditorHTML = chordProToEditorHTML;
window.editorHTMLToChordPro = editorHTMLToChordPro;
window.getSectionTheme = getSectionTheme;
window.isInstrumentalSectionType = isInstrumentalSectionType;
window.chordProToSections = chordProToSections;
window.sectionsToChordPro = sectionsToChordPro;
window.parseLineChordPro = parseLineChordPro;
window.formatLineChordPro = formatLineChordPro;


