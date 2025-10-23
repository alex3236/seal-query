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
            <h1 className="text-2xl font-semibold mb-6 text-center">TOTP 生成</h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                请扫描下方二维码以添加到 Authenticator 应用
            </p>
            {secret && (
                <>
                    <div className="flex justify-center mb-6 border border-gray-300 dark:border-gray-600 rounded-2xl p-4 w-fit mx-auto">
                        <QRCodeSVG value={otpauth} bgColor="#ffffff00" fgColor="#303030ff" className="w-32 h-32 dark:filter dark:invert" />
                    </div>
                    <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 rounded">TOTP_SECRET={secret}</span>
                    </p>
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
                    placeholder="输入 TOTP"
                />
            </form>
            {
                verifyStatus === 'success' ? <p className="text-center text-green-700 dark:text-green-200">验证成功</p>
                    : verifyStatus === 'error' ? <p className="text-center text-red-500 dark:text-red-400">验证失败</p>
                        : <p className="text-center text-gray-600 dark:text-gray-300">请输入 TOTP</p>
            }
        </>
    )
}