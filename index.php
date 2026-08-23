<?php
/**
 * Levare OS v2.0 - Main Application Router Entrypoint
 */

// Include Shared Header
require_once __DIR__ . '/views/includes/header.php'; 
?>

<!-- Immediate inline guard script to prevent initial Auth container flash if user has token -->
<script>
    (function() {
        try {
            var token = localStorage.getItem('worship_token');
            var user = localStorage.getItem('worship_currentUser');
            if (token && user && user !== 'null') {
                document.documentElement.classList.add('user-is-authenticated');
            }
        } catch (e) {}
    })();
</script>
<style>
    /* Prevent login flash when user is already authenticated */
    html.user-is-authenticated #auth-container {
        display: none !important;
    }
    html.user-is-authenticated #main-container {
        display: flex !important;
    }
</style>

<div id="app" class="min-h-screen flex flex-col justify-between">
    <!-- AUTH CONTAINER (Login / Register / Onboarding) -->
    <div id="auth-container" class="auth-container">
        <div id="auth-forms-wrapper" class="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 screen-fade">
            <?php include __DIR__ . '/views/login.php'; ?>
        </div>
        
        <div id="auth-onboarding-panel" class="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 screen-fade hidden">
            <?php include __DIR__ . '/views/onboarding.php'; ?>
        </div>
    </div>


    <!-- MAIN APP CONTAINER (Responsive Desktop & Mobile Layout) -->
    <div id="main-container" class="main-container hidden w-full max-w-4xl mx-auto min-h-screen flex flex-col relative pb-36 md:pb-20 px-4 md:px-8">
        <main id="main-content" class="flex-1 screen-fade w-full pt-4">
            <div id="panel-dashboard" class="content-view">
                <?php include __DIR__ . '/views/dashboard.php'; ?>
            </div>
            <div id="panel-songs" class="content-view hidden">
                <?php include __DIR__ . '/views/songs.php'; ?>
            </div>
            <div id="panel-setlists" class="content-view hidden">
                <?php include __DIR__ . '/views/setlists.php'; ?>
            </div>
            <div id="panel-events" class="content-view hidden">
                <?php include __DIR__ . '/views/events.php'; ?>
            </div>
            <div id="panel-profile" class="content-view hidden">
                <?php include __DIR__ . '/views/profile.php'; ?>
            </div>
            <div id="panel-feedback" class="content-view hidden">
                <?php include __DIR__ . '/views/feedback.php'; ?>
            </div>
            <div id="panel-members" class="content-view hidden">
                <?php include __DIR__ . '/views/members.php'; ?>
            </div>
            <div id="panel-suggestions" class="content-view hidden">
                <?php include __DIR__ . '/views/suggestions.php'; ?>
            </div>
            <div id="panel-announcements" class="content-view hidden">
                <?php include __DIR__ . '/views/announcements.php'; ?>
            </div>
            <div id="panel-admin" class="content-view hidden">
                <?php include __DIR__ . '/views/admin.php'; ?>
            </div>
        </main>


        <!-- Shared Responsive Navbar Component -->
        <?php require_once __DIR__ . '/views/includes/navbar.php'; ?>
    </div>
</div>

<?php 
// Include Global Modals
require_once __DIR__ . '/views/includes/modals.php';

// Include Shared Footer Scripts
require_once __DIR__ . '/views/includes/footer.php'; 
?>

