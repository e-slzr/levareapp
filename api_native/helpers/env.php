<?php
/**
 * Lightweight Native Environment Loader (.env)
 * Parses standard KEY=VALUE files without external Composer dependencies.
 */

if (!function_exists('loadEnv')) {
    function loadEnv(?string $path = null): void {
        static $loaded = false;
        if ($loaded) {
            return;
        }

        if ($path === null) {
            $path = dirname(__DIR__, 2) . '/.env';
        }

        if (!file_exists($path) || !is_readable($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            if (str_contains($line, '=')) {
                [$key, $val] = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val);

                // Strip surrounding single or double quotes
                if (
                    (str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                    (str_starts_with($val, "'") && str_ends_with($val, "'"))
                ) {
                    $val = substr($val, 1, -1);
                }

                if (!array_key_exists($key, $_SERVER)) {
                    $_SERVER[$key] = $val;
                }
                if (!array_key_exists($key, $_ENV)) {
                    $_ENV[$key] = $val;
                }
                putenv("{$key}={$val}");
            }
        }

        $loaded = true;
    }
}

if (!function_exists('env')) {
    function env(string $key, mixed $default = null): mixed {
        $val = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
        if ($val === false || $val === null) {
            return $default;
        }

        // Cast boolean and null strings
        $lower = strtolower((string)$val);
        if ($lower === 'true' || $lower === '(true)') return true;
        if ($lower === 'false' || $lower === '(false)') return false;
        if ($lower === 'null' || $lower === '(null)' || $lower === 'empty') return null;

        return $val;
    }
}
