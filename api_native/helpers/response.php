<?php
/**
 * Response and Authentication Helpers for Native API
 */

function jsonResponse($data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getBearerToken(): ?string {
    $headers = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["REDIRECT_HTTP_AUTHORIZATION"]);
    } else if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_X_TOKEN'])) {
        return trim($_SERVER['HTTP_X_TOKEN']);
    } else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        foreach ($requestHeaders as $key => $val) {
            if (strtolower($key) === 'authorization') {
                $headers = trim($val);
                break;
            }
        }
    }
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/i', $headers, $matches)) {
            return $matches[1];
        }
    }
    if (isset($_GET['token'])) {
        return trim($_GET['token']);
    }
    return null;
}

function getAuthenticatedUser(): ?array {
    $token = getBearerToken();
    if (!$token) return null;

    $pdo = DB::getConnection();

    // AuthController stores plainToken directly — try plain first
    $stmt = $pdo->prepare("SELECT tokenable_id FROM personal_access_tokens WHERE token = ? LIMIT 1");
    $stmt->execute([$token]);
    $row = $stmt->fetch();

    // Fallback: try sha256 hash (for compatibility with Sanctum-style tokens)
    if (!$row) {
        $tokenHash = hash('sha256', $token);
        $stmt = $pdo->prepare("SELECT tokenable_id FROM personal_access_tokens WHERE token = ? LIMIT 1");
        $stmt->execute([$tokenHash]);
        $row = $stmt->fetch();
    }

    if (!$row) return null;

    $stmtUser = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    $stmtUser->execute([$row['tokenable_id']]);
    $user = $stmtUser->fetch();
    
    return $user ?: null;
}


function requireAuth(): array {
    $user = getAuthenticatedUser();
    if (!$user) {
        jsonResponse(['message' => 'Unauthenticated.'], 401);
    }
    return $user;
}

function getGroupIdHeader(): ?int {
    if (isset($_SERVER['HTTP_X_GROUP_ID'])) {
        return (int)$_SERVER['HTTP_X_GROUP_ID'];
    }
    return null;
}

function getJsonInput(): array {
    $rawInput = file_get_contents('php://input');
    if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
        $rawInput = $GLOBALS['rawInput'];
    }
    $data = json_decode($rawInput, true);
    return is_array($data) ? $data : ($_POST ?? []);
}

