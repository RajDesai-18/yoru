'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
    isVisible: boolean;
    onEnter: () => void;
}

export function SplashScreen({ isVisible, onEnter }: SplashScreenProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black cursor-pointer"
                    onClick={onEnter}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                >
                    <motion.p
                        className="text-white text-8xl font-light tracking-wide"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        夜
                    </motion.p>

                    <motion.p
                        className="text-white/60 text-lg font-light tracking-[0.3em] uppercase mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                    >
                        Yoru
                    </motion.p>

                    <motion.p
                        className="text-white/30 text-xs font-light tracking-wide mt-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.5, 1] }}
                        transition={{ duration: 2, delay: 1.5, repeat: Infinity }}
                    >
                        Click anywhere to enter
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}