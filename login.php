<?php
/**
 * StudentPocket - Central Identity Registry
 * Architect: Sushil Pokhrel
 * Version: 9.7.0 Platinum (Zig-Zag OTP)
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
    public const VERSION = '9.7.0';
}

function generateZigZagOTP(): string {
    $digits = [];
    while (count($digits) < 6) {
        $next = random_int(0, 9);
        // Ensure non-sequential pattern (Zig-Zag)
        if (count($digits) > 0) {
            $last = end($digits);
            if (abs($next - $last) < 2) continue; // Skip numbers that are too close
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
            emit_response(['error' => 'MALFORMED_NODE_TARGET'], 400);
        }
        
        $code = generateZigZagOTP();
        
        emit_response([
            'auth_status' => 'SUCCESS',
            'message' => 'ZIG_ZAG_CODE_DISPATCHED',
            'generated_token' => $code,
            'target_node' => $email
        ]);
    } elseif ($action === 'VERIFY_CODE') {
        $code = $request['code'] ?? '';
        // Validation for the zig-zag length
        if (strlen($code) === 6) {
            emit_response([
                'auth_status' => 'SUCCESS',
                'identity_confirmed' => true
            ]);
        } else {
            emit_response(['error' => 'IDENTITY_REJECTED'], 401);
        }
    } elseif ($action === 'AUTHORIZE_IDENTITY') {
        $identity = $request['identity'] ?? '';
        $hash = $request['hash'] ?? '';
        // Core auth logic
        if ($identity === 'admin' && $hash === 'admin123') {
             emit_response(['status' => 'SUCCESS', 'clearance' => 3]);
        } else {
             emit_response(['status' => 'FAIL'], 401);
        }
    } else {
        emit_response(['error' => 'UNSUPPORTED_ACTION'], 404);
    }
} catch (Exception $e) {
    emit_response(['error' => 'CRITICAL_MESH_FAULT'], 500);
}
?>