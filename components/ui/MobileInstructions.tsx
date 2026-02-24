/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "yoru-instructions-seen";

interface MobileInstructionsProps {
    isVisible: boolean;
    onClose: () => void;
    onReset: () => void;
}

export function MobileInstructions({
    isVisible,
    onClose,
    onReset,
}: MobileInstructionsProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center px-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={onClose}
                >
                    <div
                        className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3
                                className="text-white text-sm font-medium tracking-wide uppercase"
                                style={{ fontFamily: "'Clash Display', sans-serif" }}
                            >
                                How to use
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-white/50 hover:text-white min-h-8 min-w-8"
                                aria-label="Close instructions"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <Instruction symbol="←  →" label="Tap left / right" detail="Change scenes" />
                            <Instruction symbol="●" label="Tap Once" detail="Show / hide controls" />
                            <Instruction symbol="●●" label="Double-tap center" detail="Play / pause" />
                            <Instruction symbol="↕" label="Swipe up / down" detail="Adjust volume" />
                            <Instruction symbol="♪" label="Tap volume icon" detail="Show volume slider" />
                            <Instruction symbol="●●" label="Tap volume icon" detail="Toggle mute" />
                            <Instruction symbol={<Radio className="h-4 w-4" />} label="Tap ambient icon" detail="Change sounds" />
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-6 w-full text-xs text-white/40 hover:text-white/60 py-2.5 border border-white/10 hover:border-white/20 rounded-lg transition-colors tracking-wide uppercase"
                        >
                            Understood
                        </button>

                        <button
                            onClick={onReset}
                            className="mt-2 w-full text-xs text-white/30 hover:text-white/50 py-2.5 border border-white/10 hover:border-white/15 rounded-lg transition-colors tracking-wide"
                        >
                            Reset Preferences
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Instruction({
    symbol,
    label,
    detail,
}: {
    symbol: React.ReactNode;
    label: string;
    detail: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm w-8 text-center font-mono flex items-center justify-center">
                {symbol}
            </span>
            <div>
                <p className="text-white/80 text-sm font-medium">{label}</p>
                <p className="text-white/40 text-xs">{detail}</p>
            </div>
        </div>
    );
}

export function useInstructionsSeen() {
    const [seen, setSeen] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            setSeen(false);
        }
    }, []);

    const markSeen = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setSeen(true);
    };

    return { seen, markSeen };
}