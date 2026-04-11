"use client";

import { useRef, useState } from "react";
import { useLang } from "../components/lang-context";
import { translations } from "../i18n/translations";
import { NavBar } from "../components/navbar";
import { removeBackground } from "@imgly/background-removal";

export default function BackgroundRemoverPage() {
    const { lang } = useLang();
    const t = translations[lang];
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resultUrlRef = useRef<string | null>(null);

    const loadFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            setImage(event.target?.result as string);
            setResult(null);
            setError(false);
            // revoke previous result URL
            if (resultUrlRef.current) {
                URL.revokeObjectURL(resultUrlRef.current);
                resultUrlRef.current = null;
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            loadFile(e.target.files[0]);
            e.target.value = "";
        }
    };

    const handleRemove = async () => {
        if (!image) return;
        setIsLoading(true);
        setError(false);
        try {
            const blob = await removeBackground(image);
            const url = URL.createObjectURL(blob);
            resultUrlRef.current = url;
            setResult(url);
        } catch (err) {
            console.error("Error removing background:", err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            loadFile(e.dataTransfer.files[0]);
        }
    };

    const handleNewUploadClick = () => {
        setImage(null);
        setResult(null);
        setError(false);
        if (resultUrlRef.current) {
            URL.revokeObjectURL(resultUrlRef.current);
            resultUrlRef.current = null;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <NavBar
                variant="tool"
                title={t.home.tools["background-remover"].title}
                backLabel={t.common.back}
            />
            <main className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-10">
                {/* hidden input always mounted so the ref is always valid */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                />
                <div
                    className={`space-y-4 rounded-lg ${isDragging ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                >
                    {!image && (
                        <div className="w-full p-8 md:p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 10l-4-4m0 0L8 10m4-4v12" />
                                </svg>
                                <p className="text-zinc-500 text-base md:text-lg">{t.backgroundRemover.upload}</p>
                            </label>
                        </div>
                    )}

                    {image && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-base md:text-lg font-semibold mb-2">{t.backgroundRemover.original}</h3>
                                <img src={image} alt="Original" className="rounded-lg shadow-md w-full object-contain max-h-72 md:max-h-none" />
                            </div>
                            {(isLoading || result || error) && (
                                <div className="flex flex-col">
                                    <h3 className="text-base md:text-lg font-semibold mb-2">{t.backgroundRemover.result}</h3>
                                    {isLoading ? (
                                        <div className="flex flex-1 min-h-32 items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                            <p className="text-zinc-500 text-sm md:text-base">{t.backgroundRemover.loading}</p>
                                        </div>
                                    ) : error ? (
                                        <div className="flex flex-1 min-h-32 items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                            <p className="text-red-500 text-sm md:text-base">{t.backgroundRemover.error}</p>
                                        </div>
                                    ) : (
                                        <img src={result!} alt="Result" className="rounded-lg shadow-md w-full object-contain max-h-72 md:max-h-none" />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {image && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            
                            {!result && !isLoading && (
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="cursor-pointer px-4 py-2.5 bg-blue-600 dark:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-sm md:text-base w-full sm:w-auto text-center"
                                >
                                    {t.backgroundRemover.remove}
                                </button>
                            )}
                            {result && (
                                <a
                                    href={result}
                                    download="background-removed.png"
                                    className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm md:text-base w-full sm:w-auto text-center"
                                >
                                    {t.backgroundRemover.download}
                                </a>
                            )}
                            {!isLoading && (
                                <button
                                    type="button"
                                    onClick={handleNewUploadClick}
                                    className="cursor-pointer px-4 py-2.5 bg-zinc-800 text-white rounded-lg text-sm md:text-base w-full sm:w-auto text-center"
                                >
                                    {t.backgroundRemover.uploadNew}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}