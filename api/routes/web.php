<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $path = base_path('../index.html');
    if (file_exists($path)) {
        return response()->file($path);
    }
    return response()->json(['message' => 'Levare API Server Active']);
});
