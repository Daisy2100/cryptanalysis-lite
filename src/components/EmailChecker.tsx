"use client";

import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import Breach from "@/types/Breach";

const EmailChecker: React.FC = () => {
    const [email, setEmail] = useState("");
    const [breaches, setBreaches] = useState<Breach[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkEmail = async () => {
        if (!email) return;

        setIsLoading(true);
        setBreaches(null);
        setError(null);

        try {
            // Note: The V2 API requires an API key and is not free for public use.
            // This is a placeholder for the API call.
            // In a real application, this request should be proxied through a backend to protect the API key.
            const response = await fetch(
                `https://haveibeenpwned.com/api/v2/breachedaccount/${encodeURIComponent(
                    email
                )}`
            );

            if (response.status === 404) {
                setBreaches([]); // No breaches found
            } else if (response.ok) {
                const data = await response.json();
                setBreaches(data);
            } else {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
        } catch (err) {
            setError(
                "無法獲取資料。請注意，此 API 需要 API 金鑰，且不應在沒有後端代理的情況下於前端直接呼叫。此為功能展示。 "
            );
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-wrap justify-content-center p-4">
            <Card title="📧 信箱洩漏驗證" className="shadow-5">
                <div className="p-inputgroup">
                    <InputText
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="輸入您的電子信箱"
                        className="w-full"
                    />
                    <Button
                        label="檢查"
                        icon="pi pi-search"
                        onClick={checkEmail}
                        loading={isLoading}
                        disabled={!email}
                    />
                </div>

                {error && (
                    <Message severity="error" text={error} className="mt-4" />
                )}

                {breaches && (
                    <div className="mt-4">
                        {breaches.length === 0 ? (
                            <Message
                                severity="success"
                                text="好消息！在已知的資料外洩事件中找不到此電子信箱。"
                            />
                        ) : (
                            <div>
                                <Message
                                    severity="error"
                                    text={`糟糕！此電子信箱出現在 ${breaches.length} 次資料外洩事件中。`}
                                />
                                <ul className="list-none p-0 m-0 mt-4">
                                    {breaches.map((breach: Breach) => (
                                        <li
                                            key={breach.Name}
                                            className="p-2 border-bottom-1 border-gray-700"
                                        >
                                            <h5 className="m-0">
                                                {breach.Name}
                                            </h5>
                                            <small>
                                                洩漏日期: {breach.BreachDate}
                                            </small>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default EmailChecker;
