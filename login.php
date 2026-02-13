
<?php
/**
 * STUDENTPOCKET - CENTRAL IDENTITY REGISTRY
 * ARCHITECT: SUSHIL POKHREL
 * VERSION: 16.9.0 PLATINUM EXECUTIVE
 * ------------------------------------------------
 * INSTITUTIONAL SECURITY PROTOCOL ACTIVE
 */

declare(strict_types=1);

ob_start();

// PROFESSIONAL HEADERS
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

final class SYSTEM_REGISTRY_CONFIG {
    public const NODE_DOMAIN = 'SUSHILPOKHAREL00.COM.NP';
    public const VERSION = 'V16.9.0';
    public const MASTER_ID = 'SUSHIL_ADMIN';
    public const MASTER_SECRET = 'ADMIN123';
}

/**
 * GENERATES A NON-SEQUENTIAL INSTITUTIONAL TOKEN
 */
function GENERATE_SECURITY_TOKEN(): string {
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

function EMIT_INSTITUTIONAL_RESPONSE(array $payload, int $status_code = 200): void {
    ob_clean();
    http_response_code($status_code);
    echo json_encode(array_merge([
        'NODE' => SYSTEM_REGISTRY_CONFIG::NODE_DOMAIN,
        'STATUS' => 'ONLINE',
        'VERSION' => SYSTEM_REGISTRY_CONFIG::VERSION,
        'TIMESTAMP' => time()
    ], $payload));
    exit;
}

try {
    $raw_input = file_get_contents('php://input');
    $request = json_decode($raw_input, true) ?? [];
    $action = strtoupper($request['action'] ?? '');

    if ($action === 'AUTHORIZE_IDENTITY') {
        $identity = strtoupper($request['identity'] ?? '');
        $hash = strtoupper($request['hash'] ?? '');
        
        if ($identity === SYSTEM_REGISTRY_CONFIG::MASTER_ID && $hash === SYSTEM_REGISTRY_CONFIG::MASTER_SECRET) {
             EMIT_INSTITUTIONAL_RESPONSE([
                 'AUTH_STATUS' => 'SUCCESS', 
                 'CLEARANCE' => 'MASTER_ARCHITECT',
                 'MESSAGE' => 'AUTHORITY GRANTED'
             ]);
        } else {
             EMIT_INSTITUTIONAL_RESPONSE([
                 'STATUS' => 'SUCCESS', 
                 'MESSAGE' => 'LOCAL_NODE_VERIFICATION_REQUIRED'
             ], 200);
        }
    } elseif ($action === 'SEND_VERIFICATION_CODE') {
        $email = strtoupper($request['email'] ?? '');
        if (empty($email)) {
            EMIT_INSTITUTIONAL_RESPONSE(['AUTH_STATUS' => 'FAILED', 'ERROR' => 'MALFORMED_NODE_TARGET'], 400);
        }
        
        $code = GENERATE_SECURITY_TOKEN();
        
        EMIT_INSTITUTIONAL_RESPONSE([
            'AUTH_STATUS' => 'SUCCESS',
            'MESSAGE' => 'DISPATCH_INITIATED',
            'TOKEN' => $code,
            'TARGET' => $email
        ]);
    } else {
        EMIT_INSTITUTIONAL_RESPONSE(['ERROR' => 'UNSUPPORTED_PROTOCOL_ACTION'], 404);
    }
} catch (Exception $e) {
    EMIT_INSTITUTIONAL_RESPONSE(['ERROR' => 'CRITICAL_MESH_FAULT'], 500);
}
?>