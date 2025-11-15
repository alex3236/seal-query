import { envDesc } from "@/app/(layout)/page";

export default function InitialSetup({ missingEnvs }: { missingEnvs: Record<string, envDesc> }) {
    return (
        <div>
            <h1 className="text-2xl font-semibold mb-6 text-center">初始化</h1>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative font-mono" role="alert">
                <p>请设置以下环境变量：</p>
                <ul className="mt-2 list-disc list-inside font-semibold">
                    {Object.keys(missingEnvs).map((envVar) => (
                        <li key={envVar} className="break-all">
                            {typeof missingEnvs[envVar] !== "string" ? (
                                <a
                                    href={missingEnvs[envVar].url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-red-800"
                                >
                                    {envVar}
                                </a>
                            ) : (
                                <span>{envVar}</span>
                            )}
                            {<span className="text-gray-600 ml-1">
                                ({typeof missingEnvs[envVar] === "string" ? missingEnvs[envVar] : missingEnvs[envVar].desc})
                            </span>}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}