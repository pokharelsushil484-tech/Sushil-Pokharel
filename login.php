<?php
/**
 * StudentPocket - Central Identity Registry
 * Architect: Sushil Pokhrel
 * Version: 9.8.5 Platinum
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
    public const VERSION = '9.8.5';
    public const ADMIN_ID = 'admin';
    public const ADMIN_PASS = 'admin123';
}

/**
 * Generates a non-sequential 6-digit code.
 */
function generateSecurityToken(): string {
    $digits = [];
    while (count($digits) < 6) {
        $next = random_int(0, 9);
        if (count($digits) > 0) {
            $last = end($digits);
            if (abs($next - $last) <= 1) continue; 
        }
        $digits[] = $next;
    }
    return implode('', $digits);
}

function emit_response(array $payload, int $status_code = 200): void {
    ob_clean();
    http_response_code($status_code);
    echo json_encode(array_merge([
        'node' => SystemConfig::NODE_DOMAIN,
        'status' => 'ONLINE',
        'version' => SystemConfig::VERSION,
        'timestamp' => time()
    ], $payload));
    exit;
}

try {
    $raw_input = file_get_contents('php://input');
    $request = json_decode($raw_input, true) ?? [];
    $action = $request['action'] ?? '';

    if ($action === 'SEND_VERIFICATION_CODE') {
        $email = $request['email'] ?? '';
        if (empty($email)) {
            emit_response(['auth_status' => 'FAILED', 'error' => 'MALFORMED_NODE_TARGET'], 400);
        }
        
        $code = generateSecurityToken();
        
        emit_response([
            'auth_status' => 'SUCCESS',
            'message' => 'DISPATCH_INITIATED',
            'generated_token' => $code,
            'target_node' => $email
        ]);
    } elseif ($action === 'ADMIN_VERIFY_LOGIN') {
        $user = $request['username'] ?? '';
        $pass = $request['password'] ?? '';
        
        if ($user === SystemConfig::ADMIN_ID && $pass === SystemConfig::ADMIN_PASS) {
            emit_response([
                'auth_status' => 'SUCCESS',
                'clearance_level' => 'MASTER',
                'message' => 'AUTHORITY_GRANTED'
            ]);
        } else {
            emit_response(['auth_status' => 'FAILED', 'error' => 'AUTHORITY_DENIED'], 401);
        }
    } elseif ($action === 'AUTHORIZE_IDENTITY') {
        $identity = $request['identity'] ?? '';
        $hash = $request['hash'] ?? '';
        
        if ($identity === 'admin' && $hash === 'admin123') {
             emit_response(['status' => 'SUCCESS', 'clearance' => 3]);
        } else {
             emit_response(['status' => 'SUCCESS', 'message' => 'LOCAL_CHECK_REQUIRED'], 200);
        }
    } else {
        emit_response(['error' => 'UNSUPPORTED_ACTION'], 404);
    }
} catch (Exception $e) {
    emit_response(['error' => 'CRITICAL_MESH_FAULT'], 500);
}
?>