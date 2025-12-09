<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OTPMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;

    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    public function build()
    {
        return $this->subject('Your SmartBin Verification Code')
                    ->html("
                        <h3>Welcome to Smart Bin!</h3>
                        <p>Your verification code is:</p>
                        <h1 style='color: #3699ff; letter-spacing: 5px;'>{$this->otp}</h1>
                        <p>This code expires in 10 minutes.</p>
                    ");
    }
}