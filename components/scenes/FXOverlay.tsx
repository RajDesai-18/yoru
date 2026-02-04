"use client";

export function FXOverlay() {
    return (
        <>
            {/* Vignette - darkens edges */}
            <div
                className="pointer-events-none fixed inset-0 z-10"
                style={{
                    background:
                        "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)",
                }}
            />

            {/* Film grain - subtle texture */}
            <div
                className="pointer-events-none fixed inset-0 z-10 opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </>
    );
}