<?php
/**
 * StudentPocket - Central Identity Registry
 * Architect: Sushil Pokhrel
 * Version: 9.5.0 Platinum (Secure OTP)
 */

declare(strict_types=1);

ob_start();

// Essential Headers for Mobile/Web Interoperability
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
    public const VERSION = '9.5.0';
}

function emit_response(array $payload, int $status_code = 200): void {
    ob_clean();
    http_response_code($status_code);
    echo json_encode(array_merge([
        'node' => SystemConfig::NODE_DOMAIN,
        'status' => 'ACTIVE',
        'attribution' => 'StudentPocket – By Sushil',
        'timestamp' => time(),
        'protocol' => 'V-9.5'
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
                'auth_status' => 'SUCCESS',
                'identity_node' => strtoupper($identity),
                'clearance' => 3
            ]);
        } else {
            emit_response([
                'auth_status' => 'DENIED', 
                'code' => 'AUTH_FAILED'
            ], 401);
        }
    } elseif ($action === 'SEND_VERIFICATION_CODE') {
        $email = $request['email'] ?? '';
        if (empty($email)) {
            emit_response(['error' => 'MISSING_NODE_EMAIL'], 400);
        }
        
        // Simulation: Code dispatched to mail servers
        emit_response([
            'auth_status' => 'SUCCESS',
            'message' => 'SECURITY_CODE_DISPATCHED',
            'node_target' => $email,
            'expiry' => 300
        ]);
    } elseif ($action === 'VERIFY_CODE') {
        $code = $request['code'] ?? '';
        // Mock verification logic
        if (strlen($code) === 6 && is_numeric($code)) {
            emit_response([
                'auth_status' => 'SUCCESS',
                'message' => 'TOKEN_VERIFIED',
                'identity_key' => bin2hex(random_bytes(16))
            ]);
        } else {
            emit_response(['error' => 'INVALID_TOKEN'], 401);
        }
    } elseif ($action === 'REGISTER_IDENTITY') {
        $identity = $request['identity'] ?? '';
        if (empty($identity)) {
            emit_response(['error' => 'MISSING_IDENTIFIER'], 400);
        }
        emit_response([
            'auth_status' => 'SUCCESS',
            'message' => 'IDENTITY_PROVISIONED',
            'node' => strtoupper($identity)
        ]);
    } else {
        emit_response(['error' => 'ILLEGAL_REQUEST'], 403);
    }
} catch (Exception $e) {
    emit_response(['error' => 'SYSTEM_FAULT'], 500);
}
?>