<?php
/**
 * UDP CoAP Receiver with Database Support
 * Run: php CoAP_Receiver.php
 */

// ================= CONFIGURATION =================
$ip = '0.0.0.0'; 
$port = 5683;    

// Database Credentials (Standard XAMPP/WAMP settings)
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "smart_bin_db"; // Your Database Name
// =================================================

// 1. Connect to Database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Database Connection failed: " . $conn->connect_error . "\n");
}
echo "Database Connected successfully.\n";

// 2. Create UDP Socket
$socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
if (!$socket) {
    die("Unable to create socket: " . socket_strerror(socket_last_error()) . "\n");
}

if (!socket_bind($socket, $ip, $port)) {
    die("Unable to bind socket: " . socket_strerror(socket_last_error()) . "\n");
}

echo "------------------------------------------------\n";
echo " PHP CoAP Listener + DB Updater Running\n";
echo " Listening on udp://$ip:$port\n";
echo " Target Table: bins (Updating ID 1)\n";
echo "------------------------------------------------\n";

while (true) {
    $buffer = '';
    $from = '';
    $port_sender = 0;

    // 3. Receive packet
    socket_recvfrom($socket, $buffer, 1024, 0, $from, $port_sender);
    $timestamp = date("Y-m-d H:i:s");
    echo "[$timestamp] Packet from $from\n";

    // 4. Extract Payload
    $payload = extractCoapPayload($buffer);
    
    if ($payload !== false) {
        // Sanitize
        $fill_level_value = trim($payload);
        
        echo " > Fill Level Received: " . $fill_level_value . "\n";
        
        // 5. UPSERT (Update or Insert)
        // This query inserts a row for ID=1. If ID=1 already exists, it just updates the fill_level.
        // This ensures you only ever have ONE row for this bin, preventing database flooding.
        $sql = "INSERT INTO bins (bin_id, fill_level) VALUES (1, ?) ON DUPLICATE KEY UPDATE fill_level = VALUES(fill_level)";
        
        $stmt = $conn->prepare($sql);
        
        if ($stmt) {
            $stmt->bind_param("s", $fill_level_value);
            
            if ($stmt->execute()) {
                echo " > [Success] Updated Bin #1 status.\n\n";
            } else {
                echo " > [Error] Could not update: " . $stmt->error . "\n\n";
            }
            $stmt->close();
        } else {
            echo " > [Error] DB Prepare failed: " . $conn->error . "\n\n";
        }

    } else {
        echo " > (Empty Payload)\n\n";
    }
}

function extractCoapPayload($binaryData) {
    $markerPos = strpos($binaryData, "\xFF");
    if ($markerPos !== false) {
        return substr($binaryData, $markerPos + 1);
    }
    return false; // Return false if no payload marker found
}
?>
