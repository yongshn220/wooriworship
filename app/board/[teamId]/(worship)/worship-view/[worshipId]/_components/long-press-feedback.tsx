import { motion } from "framer-motion";

interface Props {
    isPressing: boolean;
    x: number;
    y: number;
}

export function LongPressFeedback({ isPressing, x, y }: Props) {
    if (!isPressing) return null;

    return (
        <div
            className="fixed pointer-events-none z-[100]"
            style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)"
            }}
        >
            {/* Outer Glow Ring */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                    scale: 2.5,
                    opacity: [0, 0.5, 0.8],
                }}
                transition={{
                    duration: 1,
                    ease: "linear"
                }}
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            />

            {/* Progress Fill */}
            <svg width="100" height="100" viewBox="0 0 100 100" className="rotate-[-90deg]">
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="4"
                    fill="none"
                />
                <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "linear" }}
                />
            </svg>
        </div>
    );
}
