import { Variants } from "framer-motion";

export const slideVariants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
        position: 'absolute' as const
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        position: 'relative' as const
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0,
        position: 'absolute' as const
    })
};
