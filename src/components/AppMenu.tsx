"use client";

import React from "react";
import { Menubar } from "primereact/menubar";
import { MenuItem } from "primereact/menuitem";
import { useRouter, usePathname } from "next/navigation";

const AppMenu: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    const items: MenuItem[] = [
        {
            label: "密碼強度驗證",
            icon: "pi pi-shield",
            command: () => {
                router.push("/");
            },
            className: pathname === "/" ? "p-menuitem-active" : "",
        },
        {
            label: "信箱洩漏驗證",
            icon: "pi pi-envelope",
            command: () => {
                router.push("/email-checker");
            },
            className: pathname === "/email-checker" ? "p-menuitem-active" : "",
        },
    ];

    return (
        <div className="card">
            <Menubar model={items} />
        </div>
    );
};

export default AppMenu;
