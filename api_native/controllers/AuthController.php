<?php
/**
 * Auth & User Controller (Native PDO)
 */
class AuthController {

    public static function login(): void {
        $rawInput = file_get_contents('php://input');
        if (empty($rawInput) && isset($GLOBALS['rawInput'])) {
            $rawInput = $GLOBALS['rawInput'];
        }
        $input = json_decode($rawInput, true) ?? $_POST;
        $usernameOrEmail = trim($input['login'] ?? $input['username'] ?? $input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($usernameOrEmail) || empty($password)) {
            jsonResponse(['message' => 'Por favor, ingresa tus credenciales.'], 422);
        }

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1");
        $stmt->execute([$usernameOrEmail, $usernameOrEmail]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            jsonResponse(['message' => 'Credenciales incorrectas.'], 401);
        }

        if ($user['status'] === 'pending') {
            jsonResponse(['message' => 'Tu solicitud de cuenta está pendiente de aprobación por el Administrador.'], 403);
        }
        if ($user['status'] === 'rejected' || $user['status'] === 'blocked') {
            jsonResponse(['message' => 'Tu cuenta se encuentra inhabilitada.'], 403);
        }

        // Generate Plain Token
        $plainToken = bin2hex(random_bytes(32));

        $stmtToken = $pdo->prepare("INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
        $stmtToken->execute(['App\\Models\\User', $user['id'], 'WorshipAppToken', $plainToken, '["*"]']);

        jsonResponse([
            'token' => $plainToken,
            'user' => [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'lastname' => $user['lastname'],
                'email' => $user['email'],
                'username' => $user['username'],
                'account_type' => $user['account_type'],
                'status' => $user['status'],
                'accent_color' => $user['accent_color'],
                'accentColor' => $user['accent_color'] ?? 'purple',
                'avatar' => $user['avatar']
            ]
        ]);
    }

    public static function profile(): void {
        $user = requireAuth();
        jsonResponse([
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'lastname' => $user['lastname'],
            'email' => $user['email'],
            'username' => $user['username'],
            'account_type' => $user['account_type'],
            'status' => $user['status'],
            'must_change_password' => (bool)$user['must_change_password'],
            'accent_color' => $user['accent_color'],
            'accentColor' => $user['accent_color'] ?? 'purple',
            'avatar' => $user['avatar']
        ]);
    }

    public static function updateProfile(): void {
        $user = requireAuth();
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true) ?? $_POST;

        $name = trim($input['name'] ?? '');
        $lastname = trim($input['lastname'] ?? '');
        $username = ltrim(trim($input['username'] ?? ''), '@');
        $email = trim($input['email'] ?? '');
        $accentColor = trim($input['accentColor'] ?? $input['accent_color'] ?? 'purple');

        if (empty($name) || empty($username)) {
            jsonResponse(['message' => 'El nombre y nombre de usuario son obligatorios.'], 422);
        }

        $pdo = DB::getConnection();

        // Check unique username
        $stmtU = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1");
        $stmtU->execute([$username, $user['id']]);
        if ($stmtU->fetch()) {
            jsonResponse(['message' => 'El nombre de usuario ya se encuentra registrado.'], 422);
        }

        // Check unique email if specified
        if (!empty($email) && $user['account_type'] !== 'member') {
            $stmtE = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
            $stmtE->execute([$email, $user['id']]);
            if ($stmtE->fetch()) {
                jsonResponse(['message' => 'El correo electrónico ya se encuentra registrado por otro usuario.'], 422);
            }
        }

        $sql = "UPDATE users SET name = ?, lastname = ?, username = ?, accent_color = ?, updated_at = NOW()";
        $params = [$name, $lastname, $username, $accentColor];

        if ($user['account_type'] !== 'member' && !empty($email)) {
            $sql .= ", email = ?";
            $params[] = $email;
        }

        $sql .= " WHERE id = ?";
        $params[] = $user['id'];

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Refetch user
        $stmtRefresh = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
        $stmtRefresh->execute([$user['id']]);
        $updatedUser = $stmtRefresh->fetch();

        jsonResponse([
            'message' => 'Perfil actualizado correctamente.',
            'user' => [
                'id' => (int)$updatedUser['id'],
                'name' => $updatedUser['name'],
                'lastname' => $updatedUser['lastname'],
                'email' => $updatedUser['email'],
                'username' => $updatedUser['username'],
                'account_type' => $updatedUser['account_type'],
                'status' => $updatedUser['status'],
                'accent_color' => $updatedUser['accent_color'],
                'accentColor' => $updatedUser['accent_color'] ?? 'purple',
                'avatar' => $updatedUser['avatar']
            ]
        ]);
    }

    public static function uploadAvatar(): void {
        $user = requireAuth();

        if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            jsonResponse(['message' => 'No se seleccionó ningún archivo de imagen válido.'], 400);
        }

        $file = $_FILES['avatar'];
        $tmpPath = $file['tmp_name'];
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        $allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
        if (!in_array($extension, $allowedExts)) {
            jsonResponse(['message' => 'El formato de archivo no es soportado. Usa JPG, PNG o WEBP.'], 422);
        }

        if ($file['size'] > 2 * 1024 * 1024) {
            jsonResponse(['message' => 'La imagen supera el tamaño máximo permitido (2MB).'], 422);
        }

        $storageDir = __DIR__ . '/../../storage/avatars';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0755, true);
        }

        $filename = bin2hex(random_bytes(16)) . '.' . $extension;
        $destPath = $storageDir . '/' . $filename;

        if (!move_uploaded_file($tmpPath, $destPath)) {
            jsonResponse(['message' => 'Error al guardar la foto de perfil en el servidor.'], 500);
        }

        $avatarPath = 'avatars/' . $filename;

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$avatarPath, $user['id']]);

        jsonResponse([
            'message' => 'Foto de perfil actualizada correctamente.',
            'avatar_url' => $avatarPath
        ]);
    }

    public static function removeAvatar(): void {
        $user = requireAuth();

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("UPDATE users SET avatar = NULL, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);

        jsonResponse(['message' => 'Foto de perfil eliminada correctamente.']);
    }

    public static function changePassword(): void {
        $user = requireAuth();
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true) ?? $_POST;

        $currentPw = $input['current_password'] ?? '';
        $newPw = $input['password'] ?? $input['new_password'] ?? '';
        $confirmPw = $input['password_confirmation'] ?? $input['confirm_password'] ?? '';

        if (empty($newPw) || strlen($newPw) < 6) {
            jsonResponse(['message' => 'La nueva contraseña debe tener al menos 6 caracteres.'], 422);
        }

        if ($newPw !== $confirmPw) {
            jsonResponse(['message' => 'Las nuevas contraseñas no coinciden.'], 422);
        }

        $pdo = DB::getConnection();
        
        // If current_password is provided, verify it
        if (!empty($currentPw)) {
            $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$user['id']]);
            $dbUser = $stmt->fetch();
            if (!$dbUser || !password_verify($currentPw, $dbUser['password'])) {
                jsonResponse(['message' => 'La contraseña actual ingresada es incorrecta.'], 422);
            }
        }

        $hashedPw = password_hash($newPw, PASSWORD_BCRYPT);
        $stmtUpdate = $pdo->prepare("UPDATE users SET password = ?, must_change_password = 0, updated_at = NOW() WHERE id = ?");
        $stmtUpdate->execute([$hashedPw, $user['id']]);

        jsonResponse(['message' => 'Contraseña cambiada exitosamente.']);
    }

    public static function checkUsername(): void {
        $username = ltrim(trim($_GET['username'] ?? ''), '@');
        $excludeId = isset($_GET['exclude_id']) ? (int)$_GET['exclude_id'] : 0;

        if (empty($username)) {
            jsonResponse(['available' => false, 'message' => 'Nombre de usuario requerido.'], 422);
        }

        $pdo = DB::getConnection();
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1");
        $stmt->execute([$username, $excludeId]);
        $exists = $stmt->fetch();

        if ($exists) {
            jsonResponse(['available' => false, 'message' => 'El @username no está disponible.']);
        } else {
            jsonResponse(['available' => true, 'message' => 'El @username está disponible.']);
        }
    }

    public static function logout(): void {
        $user = requireAuth();
        $token = getBearerToken();
        if ($token) {
            $tokenHash = hash('sha256', $token);
            $pdo = DB::getConnection();
            $stmt = $pdo->prepare("DELETE FROM personal_access_tokens WHERE token = ? OR token = ?");
            $stmt->execute([$tokenHash, $token]);
        }
        jsonResponse(['message' => 'Sesión cerrada correctamente.']);
    }
}
