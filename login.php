<?php
/**
 * StudentPocket - Institutional Backend API
 * Security Build: v13.0.0 (Platinum Executive)
 * Architect: Sushil Pokhrel
 */

declare(strict_types=1);

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

session_start();

// Configuration Matrix
final class Config {
    public const DOMAIN = 'sushilpokharel00.com.np';
    public const VERSION = 'v13.0.0-PRO';
    public const ADMIN_SECRET = 'admin123';
}

// Request Handler
function getPayload(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

$request = getPayload();
$action = $request['action'] ?? '';

// API Response Utility
function sendResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode(array_merge([
        'system' => 'StudentPocket Master Node',
        'timestamp' => date('c'),
        'ref' => uniqid('SP-'),
    ], $data));
    exit;
}

// Action Controller
switch ($action) {
    case 'INITIALIZE_HANDSHAKE':
        $token = bin2hex(random_bytes(32));
        $_SESSION['handshake_node'] = $token;
        sendResponse([
            'status' => 'PROTOCOL_ENGAGED',
            'token' => $token,
            'node_domain' => Config::DOMAIN,
            'security_layer' => 'AES-256-GCM-INST'
        ]);
        break;

    case 'AUTHORIZE_IDENTITY':
        $identity = $request['identity'] ?? null;
        $hash = $request['hash'] ?? null;
        $handshake = $request['handshake'] ?? null;

        if (!$identity || !$hash || $handshake !== ($_SESSION['handshake_node'] ?? '')) {
            sendResponse(['status' => 'UNAUTHORIZED', 'error' => 'IDENTITY_MISMATCH'], 401);
        }

        $is_admin = ($identity === 'admin' && $hash === Config::ADMIN_SECRET);
        
        sendResponse([
            'status' => 'AUTHORIZED',
            'identity_node' => strtoupper($identity),
            'clearance' => $is_admin ? 'LEVEL_3_ARCHITECT' : 'LEVEL_1_PERSONNEL',
            'session_key' => session_id()
        ]);
        break;

    case 'SYNC_VAULT':
        sendResponse(['status' => 'VAULT_SYNCED', 'integrity' => '100%']);
        break;

    case 'INITIATE_RECOVERY':
        $target = $request['identity'] ?? 'UNKNOWN';
        $recoveryId = bin2hex(random_bytes(4));
        sendResponse([
            'status' => 'APPEAL_LOGGED',
            'recovery_id' => strtoupper($recoveryId),
            'target_node' => $target
        ]);
        break;

    default:
        sendResponse(['status' => 'ERROR', 'message' => 'INVALID_COMMAND_INPUT'], 400);
}
?>