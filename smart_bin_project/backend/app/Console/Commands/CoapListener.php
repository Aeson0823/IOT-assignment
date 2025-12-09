<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SmartBin; // Use your existing Model
use Carbon\Carbon;

class CoapListener extends Command
{
    /**
     * The name and signature of the console command.
     * We run this by typing: php artisan coap:listen
     */
    protected $signature = 'coap:listen';

    /**
     * The console command description.
     */
    protected $description = 'Starts a UDP CoAP Server to listen for Smart Bin data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ip = '0.0.0.0';
        $port = 5683;

        // 1. Create UDP Socket
        $socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
        if (!$socket) {
            $this->error("Unable to create socket: " . socket_strerror(socket_last_error()));
            return;
        }

        if (!socket_bind($socket, $ip, $port)) {
            $this->error("Unable to bind socket: " . socket_strerror(socket_last_error()));
            return;
        }

        $this->info("------------------------------------------------");
        $this->info(" Smart Bin CoAP Listener Running");
        $this->info(" Listening on udp://$ip:$port");
        $this->info("------------------------------------------------");

        while (true) {
            $buffer = '';
            $from = '';
            $port_sender = 0;

            // 2. Receive packet (This blocks until data arrives)
            // We use @ to suppress warnings if the read times out briefly
            @socket_recvfrom($socket, $buffer, 1024, 0, $from, $port_sender);
            
            if (!empty($buffer)) {
                $timestamp = Carbon::now()->toDateTimeString();
                $this->line("[$timestamp] Packet received from $from");

                // 3. Extract Payload
                $payload = $this->extractCoapPayload($buffer);

                if ($payload !== false) {
                    $fill_level_value = (int) trim($payload);
                    $this->info(" > Payload (Fill Level): $fill_level_value");

                    // 4. Update Database using Laravel Model
                    // NOTE: Your script hardcoded Bin ID 1. 
                    // ideally the 'from' IP or payload should tell us WHICH bin it is.
                    // For now, we update Bin #1 as per your request.
                    
                    try {
                        $bin = SmartBin::where('bin_identifier', 'BIN-101')->first(); // Assuming BIN-101 is ID 1

                        if ($bin) {
                            $bin->fill_level = $fill_level_value;
                            $bin->updated_at = now();
                            $bin->save();
                            
                            $this->info(" > [Success] Database updated for {$bin->bin_identifier}");
                        } else {
                            $this->error(" > [Error] Bin not found in database.");
                        }
                    } catch (\Exception $e) {
                        $this->error(" > [DB Error] " . $e->getMessage());
                    }

                } else {
                    $this->warn(" > (Empty or Invalid Payload)");
                }
            }
            
            // Small sleep to prevent CPU hogging if loop runs tight
            usleep(100000); 
        }
    }

    private function extractCoapPayload($binaryData) {
        // CoAP payload is separated from header by 0xFF marker
        $markerPos = strpos($binaryData, "\xFF");
        if ($markerPos !== false) {
            return substr($binaryData, $markerPos + 1);
        }
        return false;
    }
}