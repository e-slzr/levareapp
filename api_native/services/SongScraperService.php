<?php
/**
 * Song Scraper Service for Levare API
 * Downloads and parses chords & lyrics from URLs (e.g. LaCuerda.net)
 */

class SongScraperService {

    /**
     * Fetch and parse song from a given URL
     *
     * @param string $url
     * @return array
     * @throws Exception
     */
    public static function scrape(string $url): array {
        $url = trim($url);

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new Exception("La URL proporcionada no es válida.");
        }

        // Security check: only allow http and https protocols
        $scheme = strtolower(parse_url($url, PHP_URL_SCHEME) ?? '');
        if (!in_array($scheme, ['http', 'https'], true)) {
            throw new Exception("Solo se permiten enlaces con protocolo HTTP o HTTPS.");
        }

        // Prevent SSRF / internal IP access
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');
        if (empty($host) || in_array($host, ['localhost', '127.0.0.1', '::1', '0.0.0.0'])) {
            throw new Exception("No se permite acceder a direcciones locales o privadas.");
        }

        $html = self::fetchHtml($url);

        if (empty($html)) {
            throw new Exception("No se pudo obtener contenido de la página solicitada.");
        }

        // Normalize UTF-8 encoding
        $html = self::normalizeEncoding($html);

        // Detect parser by host
        if (strpos($host, 'lacuerda.net') !== false) {
            return self::parseLaCuerda($html, $url);
        }

        if (strpos($host, 'cifraclub.com') !== false) {
            return self::parseCifraClub($html, $url);
        }

        // Generic fallback parser for other chord sites
        return self::parseGenericChordSite($html, $url);
    }

    /**
     * Perform HTTP GET request with realistic browser headers
     */
    private static function fetchHtml(string $url): string {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_CONNECTTIMEOUT => 6,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            CURLOPT_HTTPHEADER => [
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language: es-ES,es;q=0.9,en;q=0.8',
                'Cache-Control: no-cache',
                'Sec-Fetch-Dest: document',
                'Sec-Fetch-Mode: navigate',
                'Sec-Fetch-Site: none'
            ],
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $content = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($content === false || $httpCode >= 400) {
            throw new Exception("Error al conectar con la página (Código HTTP: {$httpCode}). " . ($error ? "Detalle: {$error}" : ""));
        }

        return $content;
    }

    /**
     * Detect and convert encoding to UTF-8
     */
    private static function normalizeEncoding(string $html): string {
        // Check charset in HTML
        if (preg_match('/<meta[^>]+charset=["\']?([^"\'>\s;]+)/i', $html, $matches)) {
            $charset = strtoupper($matches[1]);
            if ($charset !== 'UTF-8' && function_exists('mb_convert_encoding')) {
                $converted = @mb_convert_encoding($html, 'UTF-8', $charset);
                if (!empty($converted)) return $converted;
            }
        }

        // Fallback detection
        if (function_exists('mb_detect_encoding')) {
            $detected = mb_detect_encoding($html, ['UTF-8', 'ISO-8859-1', 'WINDOWS-1252', 'ASCII'], true);
            if ($detected && $detected !== 'UTF-8') {
                $converted = @mb_convert_encoding($html, 'UTF-8', $detected);
                if (!empty($converted)) return $converted;
            }
        }

        return $html;
    }

    /**
     * Parser specialized for LaCuerda.net
     */
    private static function parseLaCuerda(string $html, string $url): array {
        $title = '';
        $artist = '';
        $key = 'G';
        $rawText = '';

        // 1. Try Extracting Title & Artist from separate <h1> and <h2> (e.g. <h1>Espíritu Santo</h1> <h2>Miel San Marcos</h2>)
        if (preg_match('/<h1[^>]*>(.*?)<\/h1>/is', $html, $h1Match)) {
            $h1Clean = trim(html_entity_decode(strip_tags($h1Match[1]), ENT_QUOTES, 'UTF-8'));
            // Check if both title and artist are inside h1 with <br>
            if (strpos($h1Match[1], '<br') !== false) {
                $h1Lines = array_values(array_filter(array_map('trim', explode("\n", strip_tags(str_ireplace(['<br>', '<br/>', '<br />'], "\n", $h1Match[1]))))));
                if (count($h1Lines) >= 2) {
                    $title = ucwords(mb_strtolower($h1Lines[0], 'UTF-8'));
                    $artist = ucwords(mb_strtolower($h1Lines[1], 'UTF-8'));
                } elseif (count($h1Lines) === 1) {
                    $title = ucwords(mb_strtolower($h1Lines[0], 'UTF-8'));
                }
            } else if (!empty($h1Clean)) {
                $title = ucwords(mb_strtolower($h1Clean, 'UTF-8'));
            }
        }

        // Try extracting artist from <h2> if not found yet
        if (empty($artist) && preg_match('/<h2[^>]*>(.*?)<\/h2>/is', $html, $h2Match)) {
            $h2Clean = trim(html_entity_decode(strip_tags($h2Match[1]), ENT_QUOTES, 'UTF-8'));
            if (!empty($h2Clean)) {
                $artist = ucwords(mb_strtolower($h2Clean, 'UTF-8'));
            }
        }

        // 2. Fallback to <title> (e.g. "ESPIRITU SANTO BIENVENIDO, Miel San Marcos: Acordes")
        if (empty($title) || empty($artist)) {
            if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $m)) {
                $rawTitle = trim(html_entity_decode(strip_tags($m[1]), ENT_QUOTES, 'UTF-8'));

                // Variant A: Title (Artist)
                if (preg_match('/\(([^)]+)\)\s*$/u', $rawTitle, $artMatch)) {
                    if (empty($artist)) $artist = ucwords(mb_strtolower(trim($artMatch[1]), 'UTF-8'));
                    $rawTitle = preg_replace('/\s*\([^)]+\)\s*$/u', '', $rawTitle);
                }

                // Variant B: TITLE, Artist: Acordes
                if (preg_match('/^(.*?),\s*(.*?)\s*:\s*Acordes.*$/iu', $rawTitle, $commaMatch)) {
                    if (empty($title)) $title = ucwords(mb_strtolower(trim($commaMatch[1]), 'UTF-8'));
                    if (empty($artist)) $artist = ucwords(mb_strtolower(trim($commaMatch[2]), 'UTF-8'));
                }

                // Clean remaining suffixes
                $rawTitle = preg_replace('/\s*:\s*Acordes.*$/is', '', $rawTitle);
                $rawTitle = preg_replace('/\s*\|\s*LaCuerda.*$/is', '', $rawTitle);
                $rawTitle = preg_replace('/\s*Acordes.*$/is', '', $rawTitle);

                if (empty($title) && !empty($rawTitle)) {
                    $title = ucwords(mb_strtolower(trim($rawTitle), 'UTF-8'));
                }
            }
        }

        // 3. Extract Chords Body from all <pre> tags (take the longest non-empty block)
        if (preg_match_all('/<pre[^>]*>(.*?)<\/pre>/is', $html, $preMatches)) {
            $longest = '';
            foreach ($preMatches[1] as $candidate) {
                $cleaned = self::cleanPreBlock($candidate);
                if (strlen($cleaned) > strlen($longest)) {
                    $longest = $cleaned;
                }
            }
            $rawText = $longest;
        }

        if (empty($rawText)) {
            throw new Exception("No se encontró el bloque de letra y acordes en este enlace de LaCuerda.net.");
        }

        // 4. Detect Key from content or metadata
        $key = self::detectKeyFromText($rawText);

        return [
            'title' => $title,
            'artist' => $artist,
            'key' => $key,
            'raw_text' => $rawText,
            'url' => $url,
            'source' => 'LaCuerda.net'
        ];
    }

    /**
     * Parser specialized for CifraClub.com
     */
    private static function parseCifraClub(string $html, string $url): array {
        $title = '';
        $artist = '';
        $key = 'C';
        $rawText = '';

        // 1. Extract Title & Artist from <title> (Format: "Título (Part. ...) - Artista - Cifra Club")
        if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $m)) {
            $rawTitle = trim(html_entity_decode(strip_tags($m[1]), ENT_QUOTES, 'UTF-8'));
            $parts = explode(' - ', $rawTitle);
            if (count($parts) >= 3) {
                $title = trim($parts[0]);
                $artist = trim($parts[1]);
            } elseif (count($parts) === 2) {
                $title = trim($parts[0]);
                $artist = trim(str_replace('Cifra Club', '', $parts[1]));
            } else {
                $title = $rawTitle;
            }
        }

        // 2. Remove tabs / solos blocks before extracting chords
        $cleanedHtml = preg_replace('/<div[^>]*class=[\'"][^\'"]*tabs[^\'"]*[\'"][^>]*>.*?<\/div>/is', '', $html);
        $cleanedHtml = preg_replace('/<span[^>]*class=[\'"][^\'"]*tab[^\'"]*[\'"][^>]*>.*?<\/span>/is', '', $cleanedHtml);

        // 3. Extract <pre> body
        if (preg_match_all('/<pre[^>]*>(.*?)<\/pre>/is', $cleanedHtml, $preMatches)) {
            $longest = '';
            foreach ($preMatches[1] as $candidate) {
                // Strip tab markers inside <pre>
                $cand = preg_replace('/\[Tab\s*-[^\]]*\].*?(?=\n\n|\[|\Z)/is', '', $candidate);
                $cand = preg_replace('/Parte\s*\d+\s*de\s*\d+/i', '', $cand);
                $cand = preg_replace('/^[EBGDAeb]\|[-0-9\s\|\/\\\~hpb]+\|?\s*$/m', '', $cand);

                $candCleaned = self::cleanPreBlock($cand);
                if (strlen($candCleaned) > strlen($longest)) {
                    $longest = $candCleaned;
                }
            }
            $rawText = $longest;
        }

        if (empty($rawText)) {
            throw new Exception("No se encontró el bloque de letra y acordes en este enlace de Cifra Club.");
        }

        // 4. Detect Key
        $key = self::detectKeyFromText($rawText);

        return [
            'title' => $title,
            'artist' => $artist,
            'key' => $key,
            'raw_text' => $rawText,
            'url' => $url,
            'source' => 'Cifra Club'
        ];
    }

    /**
     * Generic parser for other chords websites
     */
    private static function parseGenericChordSite(string $html, string $url): array {
        $title = '';
        $artist = '';
        $key = 'G';
        $rawText = '';

        if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $m)) {
            $title = trim(html_entity_decode(strip_tags($m[1]), ENT_QUOTES, 'UTF-8'));
        }

        if (preg_match_all('/<pre[^>]*>(.*?)<\/pre>/is', $html, $preMatches)) {
            $longest = '';
            foreach ($preMatches[1] as $candidate) {
                $cleaned = self::cleanPreBlock($candidate);
                if (strlen($cleaned) > strlen($longest)) {
                    $longest = $cleaned;
                }
            }
            $rawText = $longest;
        }

        if (empty($rawText)) {
            if (preg_match_all('/<code[^>]*>(.*?)<\/code>/is', $html, $codeMatches)) {
                $longest = '';
                foreach ($codeMatches[1] as $candidate) {
                    $cleaned = self::cleanPreBlock($candidate);
                    if (strlen($cleaned) > strlen($longest)) {
                        $longest = $cleaned;
                    }
                }
                $rawText = $longest;
            }
        }

        if (empty($rawText)) {
            throw new Exception("No se pudo identificar un bloque de acordes en esta página.");
        }

        $key = self::detectKeyFromText($rawText);

        return [
            'title' => $title,
            'artist' => $artist,
            'key' => $key,
            'raw_text' => $rawText,
            'url' => $url,
            'source' => 'Web'
        ];
    }

    /**
     * Clean HTML tags inside <pre> preserving spacing and newlines
     */
    private static function cleanPreBlock(string $content): string {
        // Remove empty div spacers
        $content = preg_replace('/<div>\s*<\/div>/i', '', $content);
        $content = preg_replace('/<div[^>]*>/i', '', $content);
        $content = preg_replace('/<\/div>/i', "\n", $content);

        // Remove interactive chord anchors: <A>D</A> or <a href="...">D</a> -> D
        $content = preg_replace('/<a[^>]*>(.*?)<\/a>/is', '$1', $content);

        // Replace <br> with newline
        $content = preg_replace('/<br\s*\/?>/i', "\n", $content);

        // Strip remaining HTML tags
        $content = strip_tags($content);

        // Decode HTML entities
        $content = html_entity_decode($content, ENT_QUOTES, 'UTF-8');

        // Remove LaCuerda footer disclaimer links
        $content = preg_replace('/Este fichero es trabajo propio de su transcriptor.*$/is', '', $content);
        $content = preg_replace('/http:\/\/www\.lacuerda\.net.*$/i', '', $content);

        // Normalize excessive consecutive blank lines (max 2)
        $content = preg_replace('/(\r?\n\s*){3,}/', "\n\n", $content);

        return trim($content);
    }

    /**
     * Detect musical key (tonality) from extracted text
     */
    private static function detectKeyFromText(string $text): string {
        // 1. Look for explicit key annotations: "Tono: D", "Key: G#m", "Tono Base: Bm", "Notas Base del Arpegio: ... C"
        if (preg_match('/(?:Tono|Key|Tono\s*Base)\s*[:=]\s*([A-G][#b]?(?:m|maj|min)?)/i', $text, $m)) {
            return ucfirst(trim($m[1]));
        }

        // 2. Look for first chord in INTRO line: "Intro: F - Am - C - G" or "INTRO D A Bm"
        if (preg_match('/(?:INTRO|INTRODUCCI[OÓ]N)\s*[:=\s]*([A-G][#b]?(?:m|maj|min)?)/i', $text, $m)) {
            return ucfirst(trim($m[1]));
        }

        // 3. Scan first lines for the very first valid musical chord
        $lines = explode("\n", $text);
        foreach ($lines as $line) {
            $tokens = preg_split('/[\s\-\/]+/', trim($line));
            foreach ($tokens as $token) {
                if (preg_match('/^([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[29]?|[0-9]+)?)$/', $token, $chordMatch)) {
                    return ucfirst($chordMatch[1]);
                }
            }
        }

        return 'G';
    }
}
