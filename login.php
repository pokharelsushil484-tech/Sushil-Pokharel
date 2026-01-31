<?php
/**
 * StudentPocket - Central Identity Controller
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
        'timestamp' => time(),
        'attribution' => 'StudentPocket – By Sushil'
    ], $payload));
    exit;
}

$raw_input = file_get_contents('php://input');
$request = json_decode($raw_input, true) ?? [];
$action = $request['action'] ?? '';

if ($action === 'AUTHORIZE_IDENTITY') {
    $identity = $request['identity'] ?? '';
    $hash = $request['hash'] ?? '';

    // Administrative access credentials
    if ($identity === SystemConfig::ADMIN_USER && $hash === SystemConfig::ADMIN_SECRET) {
        emit_response([
            'status' => 'SUCCESS',
            'identity_node' => strtoupper($identity),
            'clearance' => 3
        ]);
    } else {
        // Return error to trigger the frontend local registry fallback
        emit_response(['error' => 'AUTHORIZATION_DENIED', 'code' => 'NOT_IN_CENTRAL_REGISTRY'], 401);
    }
} elseif ($action === 'REGISTER_IDENTITY') {
    $identity = $request['identity'] ?? '';
    $email = $request['email'] ?? '';
    
    if (empty($identity) || empty($email)) {
        emit_response(['error' => 'INCOMPLETE_DATA_STREAM'], 400);
    }

    // Provision identity in the central flow
    emit_response([
        'status' => 'SUCCESS',
        'message' => 'IDENTITY_PROVISIONED',
        'requires_local_sync' => true,
        'assigned_node' => strtoupper($identity)
    ]);
} else {
    emit_response(['error' => 'ILLEGAL_NODE_REQUEST'], 403);
}
?>