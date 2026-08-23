<?php
/**
 * Native Web Push Service for Levare (RFC 8291 AES-128-GCM + RFC 8292 VAPID)
 */

class PushService {

    private static ?array $vapidConfig = null;

    private static function getVapidConfig(): array {
        if (self::$vapidConfig === null) {
            $path = __DIR__ . '/../config/vapid.php';
            if (file_exists($path)) {
                self::$vapidConfig = require $path;
            } else {
                throw new Exception("VAPID config not found at {$path}");
            }
        }
        return self::$vapidConfig;
    }

    public static function getPublicKey(): string {
        $cfg = self::getVapidConfig();
        return $cfg['public_key'];
    }

    /**
     * Base64URL Encoding (RFC 7515)
     */
    public static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64URL Decoding (RFC 7515)
     */
    public static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }

    /**
     * Convert OpenSSL DER signature to raw 64-byte IEEE P1363 (R || S) format
     */
    private static function derToRawSignature(string $der): string {
        $offset = 2;
        if (ord($der[1]) & 0x80) {
            $offset += (ord($der[1]) & 0x7f);
        }
        
        // R Component
        $offset++; // Skip tag 0x02
        $rLen = ord($der[$offset++]);
        $r = substr($der, $offset, $rLen);
        $offset += $rLen;
        
        // S Component
        $offset++; // Skip tag 0x02
        $sLen = ord($der[$offset++]);
        $s = substr($der, $offset, $sLen);
        
        // Normalize to exactly 32 bytes each
        $r = ltrim($r, "\x00");
        $s = ltrim($s, "\x00");
        $r = str_pad($r, 32, "\x00", STR_PAD_LEFT);
        $s = str_pad($s, 32, "\x00", STR_PAD_LEFT);
        
        return $r . $s;
    }

    /**
     * Encrypt Payload using Web Push AES-128-GCM (RFC 8291)
     */
    public static function encryptPayload(string $payload, string $p256dhBase64, string $authBase64): string {
        $clientPublicKey = self::base64UrlDecode($p256dhBase64);
        $authSecret = self::base64UrlDecode($authBase64);
        $salt = random_bytes(16);

        // 1. Generate local ephemeral EC key (prime256v1)
        $localKey = openssl_pkey_new([
            'curve_name' => 'prime256v1',
            'private_key_type' => OPENSSL_KEYTYPE_EC
        ]);
        if (!$localKey) {
            throw new Exception("Error generating ephemeral EC key: " . openssl_error_string());
        }

        $localDetails = openssl_pkey_get_details($localKey);
        $localPublicKey = "\x04" . $localDetails['ec']['x'] . $localDetails['ec']['y'];

        // 2. Wrap client public key into SubjectPublicKeyInfo PEM
        $derHeader = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200');
        $clientKeyDer = $derHeader . $clientPublicKey;
        $clientKeyPem = "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($clientKeyDer), 64, "\n") . "-----END PUBLIC KEY-----\n";

        // 3. ECDH Shared Secret
        $sharedSecret = openssl_pkey_derive($clientKeyPem, $localKey, 256);
        if ($sharedSecret === false) {
            throw new Exception("ECDH key derivation failed: " . openssl_error_string());
        }

        // 4. HKDF derivations
        $keyInfo = "WebPush: info\0" . $clientPublicKey . $localPublicKey;
        $ikm = hash_hkdf('sha256', $sharedSecret, 32, $keyInfo, $authSecret);

        $cek = hash_hkdf('sha256', $ikm, 16, "Content-Encoding: aes128gcm\0", $salt);
        $nonce = hash_hkdf('sha256', $ikm, 12, "Content-Encoding: nonce\0", $salt);

        // 5. Encrypt with AES-128-GCM (delimiter byte 0x02)
        $paddedPayload = $payload . "\x02";
        $tag = '';
        $ciphertext = openssl_encrypt($paddedPayload, 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag, '', 16);
        if ($ciphertext === false) {
            throw new Exception("Payload encryption failed: " . openssl_error_string());
        }

        // 6. Build RFC 8291 body header:
        // salt (16) || record_size (4) || key_id_len (1) || local_public_key (65) || ciphertext || tag (16)
        $recordSize = pack('N', 4096);
        $keyIdLen = chr(strlen($localPublicKey));
        
        return $salt . $recordSize . $keyIdLen . $localPublicKey . $ciphertext . $tag;
    }

    /**
     * Generate VAPID Authorization Headers (RFC 8292)
     */
    public static function createVapidHeaders(string $endpoint): array {
        $cfg = self::getVapidConfig();
        $parsed = parse_url($endpoint);
        $origin = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
        if (!empty($parsed['port'])) {
            $origin .= ':' . $parsed['port'];
        }

        $header = self::base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'ES256']));
        $claims = self::base64UrlEncode(json_encode([
            'aud' => $origin,
            'exp' => time() + 86400, // 24h
            'sub' => $cfg['subject']
        ]));

        $payloadToSign = $header . '.' . $claims;
        $derSignature = '';
        $success = openssl_sign($payloadToSign, $derSignature, $cfg['private_key_pem'], OPENSSL_ALGO_SHA256);
        if (!$success) {
            throw new Exception("Error signing VAPID JWT: " . openssl_error_string());
        }

        $rawSignature = self::derToRawSignature($derSignature);
        $jwt = $payloadToSign . '.' . self::base64UrlEncode($rawSignature);

        return [
            "Authorization: vapid t={$jwt}, k={$cfg['public_key']}",
            "Crypto-Key: p256ecdsa={$cfg['public_key']}"
        ];
    }

    /**
     * Dispatch a WebPush notification to a single subscriber
     */
    public static function sendNotification(array $subscription, array $payload): array {
        $endpoint = $subscription['endpoint'] ?? '';
        $p256dh = $subscription['p256dh'] ?? '';
        $auth = $subscription['auth'] ?? '';

        if (empty($endpoint) || empty($p256dh) || empty($auth)) {
            return ['success' => false, 'error' => 'Missing subscription credentials'];
        }

        try {
            $payloadString = is_string($payload) ? $payload : json_encode($payload, JSON_UNESCAPED_UNICODE);
            $encryptedBody = self::encryptPayload($payloadString, $p256dh, $auth);
            $vapidHeaders = self::createVapidHeaders($endpoint);

            $headers = array_merge($vapidHeaders, [
                'Content-Type: application/octet-stream',
                'Content-Encoding: aes128gcm',
                'TTL: 86400',
                'Urgency: normal'
            ]);

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $endpoint,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $encryptedBody,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => true
            ]);

            $response = curl_exec($ch);
            $statusCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            // Handle invalid / expired subscriptions (404 Not Found, 410 Gone)
            if ($statusCode === 404 || $statusCode === 410) {
                self::pruneSubscription($endpoint);
                return ['success' => false, 'statusCode' => $statusCode, 'error' => 'Subscription expired or unregistered'];
            }

            if ($statusCode >= 200 && $statusCode < 300) {
                return ['success' => true, 'statusCode' => $statusCode];
            }

            return ['success' => false, 'statusCode' => $statusCode, 'error' => $curlError ?: $response];
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Dispatch WebPush notifications to multiple subscriptions in parallel
     */
    public static function sendMultiple(array $subscriptions, array $payload): array {
        $results = [];
        foreach ($subscriptions as $sub) {
            $results[] = self::sendNotification($sub, $payload);
        }
        return $results;
    }

    /**
     * Remove dead / expired subscription from database
     */
    public static function pruneSubscription(string $endpoint): void {
        try {
            $pdo = DB::getConnection();
            $stmt = $pdo->prepare("DELETE FROM push_subscriptions WHERE endpoint = ?");
            $stmt->execute([$endpoint]);
        } catch (\Throwable $e) {
            // Ignore silently
        }
    }
}
