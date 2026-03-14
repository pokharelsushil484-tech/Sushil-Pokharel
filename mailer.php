<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit;
}

$to = $input['to'] ?? '';
$subject = $input['subject'] ?? '';
$body = $input['body'] ?? '';
$smtpHost = $input['smtp_host'] ?? '';
$smtpPort = $input['smtp_port'] ?? 587;
$smtpUser = $input['smtp_user'] ?? '';
$smtpPass = $input['smtp_pass'] ?? '';
$fromEmail = $input['from_email'] ?? $smtpUser;
$fromName = $input['from_name'] ?? 'StudentPocket System';
$replyTo = $input['reply_to'] ?? '';

if (!$to || !$subject || !$body || !$smtpHost || !$smtpPort || !$smtpUser || !$smtpPass) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

function sendSmtpEmail($host, $port, $user, $pass, $fromEmail, $fromName, $to, $subject, $body, $replyTo) {
    $socket = fsockopen(($port == 465 ? "ssl://" : "") . $host, $port, $errno, $errstr, 15);
    if (!$socket) {
        throw new Exception("Could not connect to SMTP host: $host:$port ($errstr)");
    }

    $server_response = fgets($socket, 515);
    if (empty($server_response) || substr($server_response, 0, 3) != '220') {
        throw new Exception("SMTP Error: Expected 220, got $server_response");
    }

    fwrite($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
    $server_response = fgets($socket, 515);
    while (strpos($server_response, "-") === 3) {
        $server_response = fgets($socket, 515);
    }
    if (substr($server_response, 0, 3) != '250') {
        throw new Exception("SMTP Error: Expected 250, got $server_response");
    }

    if ($port == 587 || $port == 25) {
        fwrite($socket, "STARTTLS\r\n");
        $server_response = fgets($socket, 515);
        if (substr($server_response, 0, 3) != '220') {
            throw new Exception("SMTP Error: Expected 220, got $server_response");
        }
        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        
        fwrite($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
        $server_response = fgets($socket, 515);
        while (strpos($server_response, "-") === 3) {
            $server_response = fgets($socket, 515);
        }
        if (substr($server_response, 0, 3) != '250') {
            throw new Exception("SMTP Error: Expected 250, got $server_response");
        }
    }

    fwrite($socket, "AUTH LOGIN\r\n");
    $server_response = fgets($socket, 515);
    if (substr($server_response, 0, 3) != '334') {
        throw new Exception("SMTP Error: Expected 334, got $server_response");
    }

    fwrite($socket, base64_encode($user) . "\r\n");
    $server_response = fgets($socket, 515);
    if (substr($server_response, 0, 3) != '334') {
        throw new Exception("SMTP Error: Expected 334, got $server_response");
    }

    fwrite($socket, base64_encode($pass) . "\r\n");
    $server_response = fgets($socket, 515);
    if (substr($server_response, 0, 3) != '235') {
        throw new Exception("SMTP Error: Expected 235, got $server_response");
    }

    fwrite($socket, "MAIL FROM: <$fromEmail>\r\n");
    $server_response = fgets($socket, 515);
    if (substr($server_response, 0, 3) != '250') {
        throw new Exception("SMTP Error: Expected 250, got $server_response");
    }

    fwrite($socket, "RCPT TO: <$to>\r\n");
    $server_response = fgets($socket, 515);
    if (substr($server_response, 0, 3) != '250') {
        throw new Exception("SMTP Error: Expected 250, got $server_response");
    }

    fwrite($socket, "DATA\r\n");
    $server_response = fgets($socket, 515);
    if (substr($server_response, 0, 3) != '354') {
        throw new Exception("SMTP Error: Expected 354, got $server_response");
    }

    $headers = "From: $fromName <$fromEmail>\r\n";
    if ($replyTo) {
        $headers .= "Reply-To: <$replyTo>\r\n";
    }
    $headers .= "To: <$to>\r\n";
    $headers .= "Subject: $subject\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    fwrite($socket, $headers . "\r\n" . $body . "\r\n.\r\n");
    $server_response = fgets($socket, 515);
    if (substr($server_response, 0, 3) != '250') {
        throw new Exception("SMTP Error: Expected 250, got $server_response");
    }

    fwrite($socket, "QUIT\r\n");
    fclose($socket);
}

try {
    sendSmtpEmail($smtpHost, $smtpPort, $smtpUser, $smtpPass, $fromEmail, $fromName, $to, $subject, $body, $replyTo);
    echo json_encode(['status' => 'SUCCESS', 'message' => 'Email sent successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
