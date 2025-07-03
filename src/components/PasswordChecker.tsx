"use client";

import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Message } from "primereact/message";
import { Card } from "primereact/card";
import CryptoJS from "crypto-js";
import zxcvbn from "zxcvbn";

const PasswordChecker: React.FC = () => {
    const [password, setPassword] = useState("");
    const [pwnedCount, setPwnedCount] = useState<number | null>(null);
    const [strength, setStrength] = useState<any>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // In a real app, manage this securely! Avoid hardcoding keys.
    const secretKey =
        process.env.NEXT_PUBLIC_SECRET_KEY || "default-secret-key-for-dev";

    useEffect(() => {
        // Load history from local storage on component mount
        const encryptedHistory = localStorage.getItem("passwordHistory");
        if (encryptedHistory) {
            try {
                const bytes = CryptoJS.AES.decrypt(encryptedHistory, secretKey);
                const decryptedHistory = JSON.parse(
                    bytes.toString(CryptoJS.enc.Utf8)
                );
                if (Array.isArray(decryptedHistory)) {
                    setHistory(decryptedHistory);
                }
            } catch (error) {
                console.error("Failed to decrypt history:", error);
                localStorage.removeItem("passwordHistory"); // Clear corrupted data
            }
        }
    }, [secretKey]);

    const saveHistory = (newHistory: string[]) => {
        const encryptedHistory = CryptoJS.AES.encrypt(
            JSON.stringify(newHistory),
            secretKey
        ).toString();
        localStorage.setItem("passwordHistory", encryptedHistory);
        setHistory(newHistory);
    };

    const checkPwned = async (pwd: string) => {
        if (!pwd) {
            setPwnedCount(null);
            return;
        }
        setIsLoading(true);
        setPwnedCount(null);
        const sha1Hash = CryptoJS.SHA1(pwd)
            .toString(CryptoJS.enc.Hex)
            .toUpperCase();
        const prefix = sha1Hash.substring(0, 5);
        const suffix = sha1Hash.substring(5);

        try {
            const response = await fetch(
                `https://api.pwnedpasswords.com/range/${prefix}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch data from HaveIBeenPwned API");
            }
            const text = await response.text();
            const hashes = text.split("\r\n");

            let found = false;
            for (const h of hashes) {
                const [hashSuffix, count] = h.split(":");
                if (hashSuffix === suffix) {
                    setPwnedCount(parseInt(count, 10));
                    found = true;
                    break;
                }
            }
            if (!found) {
                setPwnedCount(0);
            }
        } catch (error) {
            console.error(error);
            setPwnedCount(null); // Indicate an error state
        } finally {
            setIsLoading(false);
        }
    };

    const updatePasswordStrength = (pwd: string) => {
        if (pwd) {
            const result = zxcvbn(pwd);
            setStrength(result);
        } else {
            setStrength(null);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        updatePasswordStrength(newPassword);
    };

    const handleCheckButtonClick = () => {
        checkPwned(password);
        if (password && !history.includes(password)) {
            const newHistory = [password, ...history].slice(0, 5); // Keep last 5
            saveHistory(newHistory);
        }
    };

    const getStrengthLabel = (score: number) => {
        switch (score) {
            case 0:
                return "非常弱";
            case 1:
                return "弱";
            case 2:
                return "中等";
            case 3:
                return "強";
            case 4:
                return "非常強";
            default:
                return "";
        }
    };

    const strengthColor = (score: number) => {
        switch (score) {
            case 0:
                return "danger";
            case 1:
                return "warning";
            case 2:
                return "info";
            case 3:
                return "success";
            case 4:
                return "success";
            default:
                return "info";
        }
    };

    const renderPwnedResult = () => {
        if (pwnedCount === null) return null;
        if (pwnedCount > 0) {
            return (
                <Message
                    severity="error"
                    text={`糟糕！此密碼已在 ${pwnedCount.toLocaleString()} 次資料外洩事件中出現。`}
                    className="mt-4"
                />
            );
        }
        return (
            <Message
                severity="success"
                text="好消息！在已知的資料外洩事件中找不到此密碼。"
                className="mt-4"
            />
        );
    };

    return (
        <div className="flex flex-wrap justify-content-center p-4">
            <Card title="🔐 密碼強度驗證器 + 洩漏查詢工具" className="shadow-5">
                <div className="p-inputgroup">
                    <InputText
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="輸入您的密碼"
                        className="w-full"
                    />
                    <Button
                        label="檢查"
                        icon="pi pi-check"
                        onClick={handleCheckButtonClick}
                        loading={isLoading}
                        disabled={!password}
                    />
                </div>

                {strength && (
                    <div className="mt-4">
                        <ProgressBar
                            value={(strength.score + 1) * 20}
                            color={strengthColor(strength.score)}
                        />
                        <small className="mt-2 block">
                            強度: {getStrengthLabel(strength.score)}
                        </small>
                        {strength.feedback.warning && (
                            <small className="block text-red-500">
                                {strength.feedback.warning}
                            </small>
                        )}
                        {strength.feedback.suggestions.map(
                            (s: string, i: number) => (
                                <small key={i} className="block">
                                    {s}
                                </small>
                            )
                        )}
                    </div>
                )}

                {renderPwnedResult()}

                {history.length > 0 && (
                    <div className="mt-5">
                        <h5 className="mb-2">最近檢查的密碼 (已加密儲存)</h5>
                        <ul className="list-none p-0 m-0">
                            {history.map((p, i) => (
                                <li key={i} className="font-mono p-1">
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PasswordChecker;
