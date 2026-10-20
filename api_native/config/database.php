<?php
/**
 * DB Connection Manager (Native PDO)
 */
require_once __DIR__ . '/../helpers/env.php';
loadEnv();

class DB {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $host    = env('DB_HOST', '192.168.1.100');
            $port    = env('DB_PORT', '3306');
            $db      = env('DB_DATABASE', 'levareapp_dev');
            $user    = env('DB_USERNAME', 'root');
            $pass    = env('DB_PASSWORD', '9050');
            $charset = env('DB_CHARSET', 'utf8mb4');

            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (\PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'message' => 'Database connection failed: ' . $e->getMessage()
                ]);
                exit;
            }
        }
        return self::$instance;
    }
}
