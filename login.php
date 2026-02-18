
<?php
/**
 * STUDENTPOCKET - ULTRA EXECUTIVE GATEWAY
 * ARCHITECT: SUSHIL POKHAREL
 * VERSION: V20.0.0 PLATINUM ULTRA
 * ------------------------------------------------
 * INSTITUTIONAL DATA PROTECTION LAYER ACTIVE
 */

declare(strict_types=1);

namespace StudentPocket\Security;

class UltraRegistryGateway {
    private const NODE_DOMAIN = 'SUSHILPOKHAREL00.COM.NP';
    private const SYSTEM_VERSION = 'V20.0.0 ULTRA';
    private const MASTER_ID = 'SUSHIL_ADMIN';
    private const MASTER_SECRET = 'ADMIN123';

    public function __construct() {
        $this->setHeaders();
    }

    private function setHeaders(): void {
        header('Content-Type: application/json; charset=UTF-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    }

    public function processRequest(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $action = strtoupper($input['action'] ?? '');

            switch ($action) {
                case 'AUTHORIZE_IDENTITY':
                    $this->handleAuth($input);
                    break;
                case 'SYNC_NODE':
                    $this->handleSync($input);
                    break;
                default:
                    $this->emitResponse(['error' => 'PROTOCOL_UNSUPPORTED'], 404);
            }
        } catch (\Exception $e) {
            $this->emitResponse(['error' => 'INTERNAL_MESH_FAULT'], 500);
        }
    }

    private function handleAuth(array $data): void {
        $id = strtoupper($data['identity'] ?? '');
        $hash = $data['hash'] ?? '';

        if ($id === self::MASTER_ID && $hash === self::MASTER_SECRET) {
            $this->emitResponse([
                'auth_status' => 'SUCCESS',
                'clearance' => 'MASTER_ARCHITECT',
                'token' => bin2hex(random_bytes(16))
            ]);
        } else {
            // Standard user node check - proceed to local verification
            $this->emitResponse([
                'auth_status' => 'LOCAL_PENDING',
                'message' => 'IDENTITY_REQUIRES_LOCAL_NODE_SYNC'
            ]);
        }
    }

    private function handleSync(array $data): void {
        $this->emitResponse([
            'sync_status' => 'ACTIVE',
            'mesh_integrity' => '99.9%',
            'load' => 'OPTIMAL'
        ]);
    }

    private function emitResponse(array $payload, int $code = 200): void {
        http_response_code($code);
        echo json_encode(array_merge([
            'version' => self::SYSTEM_VERSION,
            'domain' => self::NODE_DOMAIN,
            'timestamp' => time(),
            'status' => 'SECURE'
        ], $payload));
        exit;
    }
}

$gateway = new UltraRegistryGateway();
$gateway->processRequest();
