import EmailChecker from "@/components/EmailChecker";

export default function EmailCheckerPage() {
    return (
        <div className="flex flex-wrap items-center justify-items-center  p-8 pb-20  sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex items-center justify-center m-auto">
                <EmailChecker />
            </main>
        </div>
    );
}
