<?php
/**
 * StudentPocket - Strict Admin Auth Controller
 * Architect: Sushil Pokhrel
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

final class SystemConfig {
    public const NODE_DOMAIN = 'sushilpokharel00.com.np';
    public const ADMIN_USER = 'admin';
    public const ADMIN_SECRET = 'admin123';
}

function emit_response(array $payload, int $status_code = 200): void {
    http_response_code($status_code);
    echo json_encode(array_merge([
        'node' => SystemConfig::NODE_DOMAIN,
        'timestamp' => time()
    ], $payload));
    exit;
}

$raw_input = file_get_contents('php://input');
$request = json_decode($raw_input, true) ?? [];
$action = $request['action'] ?? '';

if ($action === 'AUTHORIZE_IDENTITY') {
    $identity = $request['identity'] ?? '';
    $hash = $request['hash'] ?? '';

    if ($identity === SystemConfig::ADMIN_USER && $hash === SystemConfig::ADMIN_SECRET) {
        emit_response([
            'status' => 'SUCCESS',
            'identity_node' => strtoupper($identity),
            'clearance' => 3
        ]);
    } else {
        emit_response(['error' => 'AUTHORIZATION_DENIED'], 401);
    }
} elseif ($action === 'REGISTER_IDENTITY') {
    $identity = $request['identity'] ?? '';
    $email = $request['email'] ?? '';
    
    // Mock registration success. Real verification happens via separate form.
    emit_response([
        'status' => 'SUCCESS',
        'message' => 'IDENTITY_PROVISIONED',
        'requires_verification' => true
    ]);
} else {
    emit_response(['error' => 'ILLEGAL_REQUEST'], 403);
}
?>