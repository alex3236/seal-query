"use client";
import { authenticator } from 'otplib';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

export default function TOTPPage() {
    const [secret, setSecret] = useState<string>('');
    const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        setSecret(authenticator.generateSecret());
    }, []);

    const otpauth = secret ? authenticator.keyuri("admin", "seal-query", secret) : '';

    return (
        <>
            <a className="hidden border-green-500 dark:border-green-400 border-red-500 dark:border-red-400 border-gray-300 dark:border-gray-600" />
            <h1 className="text-2xl font-semibold mb-6 text-center">TOTP Generator</h1>

            {secret && (
                <>
                    <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                        Scan the QR code below to add to Authenticator app
                        <br />
                        And set in environment variable <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 ml-2 rounded">TOTP_SECRET={secret}</span>
                    </p>
                    <div className="flex justify-center mb-6 border border-gray-300 dark:border-gray-600 rounded-2xl p-4 w-fit mx-auto">
                        <QRCodeSVG value={otpauth} bgColor="#ffffff00" fgColor="#303030ff" className="w-32 h-32 dark:filter dark:invert" />
                    </div>

                </>
            )}
            {/* use input to verify totp */}
            <form
                className="flex justify-center mb-2"
            >
                <input
                    type="text"
                    // value={totp}
                    onChange={(e) => {
                        // setTOTP(e.target.value);
                        const isValid = authenticator.check(e.target.value, secret);
                        setVerifyStatus(isValid ? 'success' : 'error');
                    }}
                    className={`w-48 p-2 border rounded-md`}
                    placeholder="Enter TOTP"
                />
            </form>
            {
                verifyStatus === 'success' ? <p className="text-center text-green-700 dark:text-green-200">Verification successful</p>
                    : verifyStatus === 'error' ? <p className="text-center text-red-500 dark:text-red-400">Verification failed</p>
                        : <p className="text-center text-gray-600 dark:text-gray-300">Please enter TOTP</p>
            }
        </>
    )
}