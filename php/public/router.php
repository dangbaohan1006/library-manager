<?php

// Router for PHP built-in server
// This file handles all requests and routes them to Laravel

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);

// If the URI exists as a file or directory, serve it directly
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Otherwise, route to Laravel's index.php
require_once __DIR__ . '/index.php';

