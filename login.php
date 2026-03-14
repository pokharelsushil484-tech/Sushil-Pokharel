
<?php
/**
 * STUDENTPOCKET - HARDENED ELITE GATEWAY V23
 * ARCHITECT: SUSHIL POKHAREL
 * VERSION: V23.0.0 PLATINUM ELITE
 * ------------------------------------------------
 * DEEP IDENTITY RESTORATION PROTOCOL ACTIVE
 */

declare(strict_types=1);

namespace StudentPocket\Security;

class EliteQuantumGateway {
    private const NODE_DOMAIN = 'SUSHILPOKHAREL00.COM.NP';
    private const SYSTEM_VERSION = 'V23.0.0 ELITE';
    private const MASTER_ID = 'SUSHIL_ADMIN';
    private const MASTER_SECRET = 'ADMIN123';

    public function __construct() {
        $this->setHardenedHeaders();
    }

    private function setHardenedHeaders(): void {
        if (headers_sent()) return;

        // We will set Content-Type dynamically based on the request method
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400');
        header('Referrer-Policy: strict-origin-when-cross-origin');
    }

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        if ($method === 'GET') {
            $this->renderUI();
            return;
        }

        if ($method !== 'POST') {
            header('Content-Type: application/json; charset=UTF-8');
            $this->respond(['error' => 'V23_PROTOCOL_RESTRICTED'], 405);
        }

        header('Content-Type: application/json; charset=UTF-8');
        try {
            $rawInput = file_get_contents('php://input');
            $payload = json_decode($rawInput, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->respond(['error' => 'INVALID_V23_SCHEMA'], 400);
            }

            $action = strtoupper($payload['action'] ?? '');

            switch ($action) {
                case 'AUTHORIZE_IDENTITY':
                    $this->authenticate($payload);
                    break;
                case 'RECOVERY_VERIFY':
                    $this->respond(['status' => 'PENDING_RESTORE', 'message' => 'V23_RECOVERY_MESH_ACTIVE']);
                    break;
                case 'HEARTBEAT':
                    $this->respond(['status' => 'ACTIVE', 'mesh' => 'ELITE_SYNC']);
                    break;
                default:
                    $this->respond(['error' => 'COMMAND_UNSUPPORTED_V23'], 404);
            }
        } catch (\Throwable $th) {
            $this->respond(['error' => 'ELITE_GATEWAY_INTERNAL_ERROR'], 500);
        }
    }

    private function authenticate(array $data): void {
        $identity = strtoupper($data['identity'] ?? '');
        $hash = $data['hash'] ?? '';

        if ($identity === self::MASTER_ID && $hash === self::MASTER_SECRET) {
            $this->respond([
                'status' => 'SUCCESS',
                'clearance' => 'ELITE_EXECUTIVE',
                'token' => bin2hex(random_bytes(32))
            ]);
        } else {
            $this->respond([
                'status' => 'PENDING_MESH_V23',
                'message' => 'IDENTITY_DISPATCHED_TO_ELITE_AUDIT'
            ]);
        }
    }

    private function respond(array $data, int $code = 200): void {
        http_response_code($code);
        echo json_encode(array_merge([
            'version' => self::SYSTEM_VERSION,
            'domain' => self::NODE_DOMAIN,
            'timestamp' => date('c'),
            'layer' => 'ELITE_QUANTUM_V23'
        ], $data), JSON_PRETTY_PRINT);
        exit;
    }

    private function renderUI(): void {
        header('Content-Type: text/html; charset=UTF-8');
        ?>
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>StudentPocket - Elite Gateway</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
                .glass-panel {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .input-field {
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    transition: all 0.3s ease;
                }
                .input-field:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                    outline: none;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    transition: all 0.3s ease;
                }
                .btn-primary:hover {
                    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            </style>
        </head>
        <body class="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-fixed">
            <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-0"></div>
            
            <div class="glass-panel rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 overflow-hidden">
                <!-- Decorative elements -->
                <div class="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                
                <div class="text-center mb-8 relative z-10">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                        <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold tracking-tight text-white mb-1">Elite Gateway</h1>
                    <p class="text-sm text-slate-400 font-medium tracking-wide uppercase">StudentPocket V23.0</p>
                </div>

                <form id="loginForm" class="space-y-5 relative z-10">
                    <div>
                        <label for="identity" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Identity Key</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input type="text" id="identity" name="identity" required
                                class="input-field block w-full pl-10 pr-3 py-3 rounded-xl text-sm placeholder-slate-500"
                                placeholder="Enter your identity key">
                        </div>
                    </div>

                    <div>
                        <label for="hash" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Security Hash</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input type="password" id="hash" name="hash" required
                                class="input-field block w-full pl-10 pr-3 py-3 rounded-xl text-sm placeholder-slate-500"
                                placeholder="Enter your security hash">
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2">
                        <div class="flex items-center">
                            <input id="remember" name="remember" type="checkbox" class="h-4 w-4 bg-slate-800 border-slate-600 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900">
                            <label for="remember" class="ml-2 block text-sm text-slate-300">
                                Secure Session
                            </label>
                        </div>
                        <div class="text-sm">
                            <a href="#" class="font-medium text-blue-400 hover:text-blue-300 transition-colors">Recover Access</a>
                        </div>
                    </div>

                    <button type="submit" class="btn-primary w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 mt-6">
                        INITIALIZE CONNECTION
                    </button>
                </form>
                
                <div id="statusMessage" class="mt-6 text-center text-sm hidden relative z-10 p-3 rounded-lg"></div>

                <div class="mt-8 pt-6 border-t border-slate-700/50 text-center relative z-10">
                    <p class="text-xs text-slate-500">Architect: Sushil Pokharel &copy; 2026</p>
                    <p class="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">Deep Identity Restoration Protocol</p>
                </div>
            </div>

            <script>
                document.getElementById('loginForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const identity = document.getElementById('identity').value;
                    const hash = document.getElementById('hash').value;
                    const statusDiv = document.getElementById('statusMessage');
                    const submitBtn = e.target.querySelector('button[type="submit"]');
                    
                    // UI Loading state
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> AUTHENTICATING...';
                    
                    try {
                        const response = await fetch('login.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                action: 'AUTHORIZE_IDENTITY',
                                identity: identity,
                                hash: hash
                            })
                        });
                        
                        const data = await response.json();
                        
                        statusDiv.classList.remove('hidden', 'bg-red-500/10', 'text-red-400', 'border-red-500/20', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20', 'bg-blue-500/10', 'text-blue-400', 'border-blue-500/20');
                        statusDiv.classList.add('border');
                        
                        if (response.ok && data.status === 'SUCCESS') {
                            statusDiv.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
                            statusDiv.innerHTML = 'Connection Established. Clearance: ' + data.clearance;
                            setTimeout(() => window.location.href = '/', 1500);
                        } else if (data.status === 'PENDING_MESH_V23') {
                            statusDiv.classList.add('bg-blue-500/10', 'text-blue-400', 'border-blue-500/20');
                            statusDiv.innerHTML = data.message;
                        } else {
                            statusDiv.classList.add('bg-red-500/10', 'text-red-400', 'border-red-500/20');
                            statusDiv.innerHTML = data.error || 'Authorization Denied';
                        }
                    } catch (err) {
                        statusDiv.classList.remove('hidden');
                        statusDiv.classList.add('bg-red-500/10', 'text-red-400', 'border-red-500/20', 'border');
                        statusDiv.innerHTML = 'Network Error: Gateway Unreachable';
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'INITIALIZE CONNECTION';
                    }
                });
            </script>
        </body>
        </html>
        <?php
    }
}

// Gateway Entry Point
(new EliteQuantumGateway())->handleRequest();
