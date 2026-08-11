<?php
/**
 * Main Central Native Router (api_native/index.php)
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Group-Id, X-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/SongController.php';
require_once __DIR__ . '/controllers/EventController.php';
require_once __DIR__ . '/controllers/MemberController.php';
require_once __DIR__ . '/controllers/GroupController.php';
require_once __DIR__ . '/controllers/SuggestionController.php';

// Request parsing
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri, PHP_URL_PATH);

// Extract path info relative to index.php or api_native
if (strpos($parsedUrl, 'index.php') !== false) {
    $path = substr($parsedUrl, strpos($parsedUrl, 'index.php') + 9);
} else if (strpos($parsedUrl, 'api_native') !== false) {
    $path = substr($parsedUrl, strpos($parsedUrl, 'api_native') + 10);
} else {
    $path = $parsedUrl;
}

$path = '/' . ltrim($path, '/');
$path = rtrim($path, '/');
if (empty($path)) $path = '/';
$method = $_SERVER['REQUEST_METHOD'];

// Route dispatching
switch ($path) {
    // Auth & Profile routes
    case '/auth/login':
        if ($method === 'POST') AuthController::login();
        break;

    case '/user/profile':
        if ($method === 'GET') AuthController::profile();
        if ($method === 'POST') AuthController::updateProfile();
        break;

    case '/user/profile/avatar':
        if ($method === 'POST') AuthController::uploadAvatar();
        if ($method === 'DELETE') AuthController::removeAvatar();
        break;

    case '/auth/change-password':
        if ($method === 'POST') AuthController::changePassword();
        break;

    case '/auth/check-username':
        if ($method === 'GET') AuthController::checkUsername();
        break;

    case '/auth/logout':
        if ($method === 'POST') AuthController::logout();
        break;


    // Song routes
    case '/songs':
        if ($method === 'GET') SongController::index();
        if ($method === 'POST') SongController::store();
        break;

    // Setlists
    case '/setlists':
        if ($method === 'GET') SetlistController::index();
        if ($method === 'POST') SetlistController::store();
        break;

    // Events
    case '/events':
        if ($method === 'GET') EventController::index();
        if ($method === 'POST') EventController::store();
        break;

    // Groups
    case '/groups':
        if ($method === 'GET') GroupController::index();
        break;

    // Members & Roles
    case '/members':
        if ($method === 'GET') MemberController::index();
        break;

    case '/members/roles':
        if ($method === 'GET') MemberController::roles();
        break;

    // Suggestions
    case '/suggestions':
        if ($method === 'GET') SuggestionController::index();
        if ($method === 'POST') SuggestionController::store();
        break;

    // Announcements
    case '/announcements':
        if ($method === 'GET') AnnouncementController::index();
        break;

    default:
        // Check for parameterized /suggestions/{id}/vote
        if (preg_match('#^/suggestions/(\d+)/vote$#', $path, $matches)) {
            $id = (int)$matches[1];
            if ($method === 'POST') SuggestionController::vote($id);
            break;
        }

        // Check for parameterized /suggestions/{id}/status
        if (preg_match('#^/suggestions/(\d+)/status$#', $path, $matches)) {
            $id = (int)$matches[1];
            if ($method === 'PUT' || $method === 'POST') SuggestionController::updateStatus($id);
            break;
        }

        // Check for parameterized /suggestions/{id}
        if (preg_match('#^/suggestions/(\d+)$#', $path, $matches)) {
            $id = (int)$matches[1];
            if ($method === 'DELETE') SuggestionController::destroy($id);
            break;
        }

        // Check for parameterized /songs/{id}
        if (preg_match('#^/songs/(\d+)$#', $path, $matches)) {
            $songId = (int)$matches[1];
            if ($method === 'GET') SongController::show($songId);
            if ($method === 'PUT' || $method === 'POST') SongController::update($songId);
            if ($method === 'DELETE') SongController::destroy($songId);
            break;
        }

        // Check for parameterized /setlists/{id}
        if (preg_match('#^/setlists/(\d+)$#', $path, $matches)) {
            $setlistId = (int)$matches[1];
            if ($method === 'PUT' || $method === 'POST') SetlistController::update($setlistId);
            if ($method === 'DELETE') SetlistController::destroy($setlistId);
            break;
        }

        // Check for parameterized /events/{id}
        if (preg_match('#^/events/(\d+)$#', $path, $matches)) {
            $eventId = (int)$matches[1];
            if ($method === 'DELETE') EventController::destroy($eventId);
            break;
        }

        jsonResponse(['message' => 'Endpoint no encontrado en API nativa.', 'path' => $path], 404);
}




