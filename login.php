<?php
/**
 * StudentPocket - Universal Identity Server
 * Architect: Sushil Pokhrel
 * Version: 9.6.0 Platinum (Resilient Mesh)
 */

declare(strict_types=1);

ob_start();

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
    public const VERSION = '9.6.0';
}

function emit_response(array $payload, int $status_code = 200): void {
    ob_clean();
    http_response_code($status_code);
    echo json_encode(array_merge([
        'node' => SystemConfig::NODE_DOMAIN,
        'sync_status' => 'ACTIVE',
        'attribution' => 'StudentPocket – By Sushil',
        'version' => SystemConfig::VERSION,
        'timestamp' => time()
    ], $payload));
    exit;
}

try {
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
            emit_response([
                'error' => 'AUTHORIZATION_DENIED', 
                'code' => 'INVALID_CREDENTIALS'
            ], 401);
        }
    } elseif ($action === 'SEND_VERIFICATION_CODE') {
        $email = $request['email'] ?? '';
        if (empty($email)) {
            emit_response(['error' => 'MISSING_TARGET_EMAIL'], 400);
        }
        
        emit_response([
            'status' => 'SUCCESS',
            'message' => 'CODE_DISPATCHED',
            'target' => $email,
            'expiry_window' => 600
        ]);
    } elseif ($action === 'VERIFY_CODE') {
        $code = $request['code'] ?? '';
        // Simulation accepts any 6-digit numeric string as valid
        if (strlen($code) === 6 && is_numeric($code)) {
            emit_response([
                'status' => 'SUCCESS',
                'message' => 'TOKEN_VALIDATED'
            ]);
        } else {
            emit_response(['error' => 'INVALID_TOKEN_FORMAT'], 400);
        }
    } elseif ($action === 'REGISTER_IDENTITY') {
        $identity = $request['identity'] ?? '';
        if (empty($identity)) {
            emit_response(['error' => 'MISSING_IDENTIFIER'], 400);
        }
        emit_response([
            'status' => 'SUCCESS',
            'message' => 'MESH_NODE_COMMITTED',
            'node_id' => strtoupper($identity)
        ]);
    } else {
        emit_response(['error' => 'ILLEGAL_ACTION_REQUEST'], 403);
    }
} catch (Exception $e) {
    emit_response(['error' => 'CORE_FAULT'], 500);
}
?>