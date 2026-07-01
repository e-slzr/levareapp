<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\SetlistController;
use App\Http\Controllers\SongController;
use App\Http\Controllers\SuggestionController;
use App\Http\Controllers\SuperAdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — WorshipApp
|--------------------------------------------------------------------------
*/

// --- Public Endpoints ---
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register/leader', [AuthController::class, 'registerLeader']);
Route::post('/auth/validate-invite-code', [AuthController::class, 'validateInviteCode']);
Route::post('/auth/register/member', [AuthController::class, 'registerMember']);

// --- Protected Endpoints (Token Authenticated) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Profile
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::get('/user/profile', [AuthController::class, 'profile']);
    Route::post('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/profile/avatar', [AuthController::class, 'uploadAvatar']);
    Route::delete('/user/profile/avatar', [AuthController::class, 'removeAvatar']);

    // Groups & Onboarding
    Route::get('/groups', [GroupController::class, 'index']);
    Route::post('/groups', [GroupController::class, 'create']);
    Route::post('/groups/join', [GroupController::class, 'join']);
    Route::post('/groups/{id}/reset-invite-code', [GroupController::class, 'resetInviteCode']);

    // Members & Custom Roles
    Route::get('/members', [MemberController::class, 'index']);
    Route::post('/members', [MemberController::class, 'store']);
    Route::put('/members/{id}', [MemberController::class, 'update']);
    Route::delete('/members/{id}', [MemberController::class, 'destroy']);
    Route::post('/members/{id}/reset-password', [MemberController::class, 'resetPassword']);
    
    Route::get('/members/roles', [MemberController::class, 'roles']);
    Route::post('/members/roles', [MemberController::class, 'addRole']);
    Route::delete('/members/roles/{name}', [MemberController::class, 'deleteRole']);

    // Song Catalog
    Route::get('/songs', [SongController::class, 'index']);
    Route::post('/songs', [SongController::class, 'store']);
    Route::put('/songs/{id}', [SongController::class, 'update']);
    Route::delete('/songs/{id}', [SongController::class, 'destroy']);

    // Setlists (Repertorios)
    Route::get('/setlists', [SetlistController::class, 'index']);
    Route::post('/setlists', [SetlistController::class, 'store']);
    Route::put('/setlists/{id}', [SetlistController::class, 'update']);
    Route::delete('/setlists/{id}', [SetlistController::class, 'destroy']);

    // Events (Cultos y Ensayos)
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    // Suggestions (Propuestas musicales)
    Route::get('/suggestions', [SuggestionController::class, 'index']);
    Route::post('/suggestions', [SuggestionController::class, 'store']);
    Route::post('/suggestions/{id}/vote', [SuggestionController::class, 'vote']);
    Route::put('/suggestions/{id}/status', [SuggestionController::class, 'updateStatus']);
    Route::delete('/suggestions/{id}', [SuggestionController::class, 'destroy']);

    // Announcements (Novedades)
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);

    // Super Admin Dashboard Control
    Route::get('/superadmin/requests', [SuperAdminController::class, 'indexPendingLeaders']);
    Route::post('/superadmin/requests/{id}/approve', [SuperAdminController::class, 'approveLeader']);
    Route::post('/superadmin/requests/{id}/reject', [SuperAdminController::class, 'rejectLeader']);
    Route::post('/superadmin/requests/{id}/block', [SuperAdminController::class, 'blockLeader']);
    Route::post('/superadmin/requests/{id}/unblock', [SuperAdminController::class, 'unblockLeader']);
    Route::post('/superadmin/requests/{id}/reset-password', [SuperAdminController::class, 'resetLeaderPassword']);
});
