"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { usePathname } from "next/navigation";
import {
  Home,
  AlertTriangle,
  Map,
  FileText,
  Bot,
  Settings,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
  { href: "/alerts", icon: <AlertTriangle className="w-5 h-5" />, label: "Alerts" },
  { href: "/map", icon: <Map className="w-5 h-5" />, label: "Map" },
  { href: "/reports", icon: <FileText className="w-5 h-5" />, label: "Reports" },
  { href: "/ai-help", icon: <Bot className="w-5 h-5" />, label: "AI Help" },
  { href: "/settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const mouseY = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const magnification = 70;
  const baseItemSize = 50;
  const distance = 200;

  return (
    <motion.div
      className="fixed right-2 top-1/2 -translate-y-1/2 flex flex-col items-center z-50"
      onMouseMove={(e) => {
        isHovered.set(1);
        mouseY.set(e.pageY);
      }}
      onMouseLeave={() => {
        isHovered.set(0);
        mouseY.set(Infinity);
      }}
    >
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-neutral-700 bg-black/20 backdrop-blur-lg px-2 py-4">
        {links.map((link, index) => {
          const ref = useRef<HTMLDivElement>(null);
          const [isVisible, setIsVisible] = useState(false);
          const itemHover = useMotionValue(0);

          const mouseDistance = useTransform(mouseY, (val) => {
            const rect = ref.current?.getBoundingClientRect() ?? {
              y: 0,
              height: baseItemSize,
            };
            return val - rect.y - baseItemSize / 2;
          });

          const targetSize = useTransform(
            mouseDistance,
            [-distance, 0, distance],
            [baseItemSize, magnification, baseItemSize]
          );

          const size = useSpring(targetSize, spring);

          useEffect(() => {
            const unsub = itemHover.on("change", (latest) => {
              setIsVisible(latest === 1);
            });
            return () => unsub();
          }, []);

          const isActive = pathname === link.href;

          return (
            <motion.div
              key={index}
              ref={ref}
              style={{
                width: size,
                height: size,
              }}
              onHoverStart={() => itemHover.set(1)}
              onHoverEnd={() => itemHover.set(0)}
              onClick={() => (window.location.href = link.href)}
              className={`relative flex items-center justify-center rounded-full border-2 border-neutral-700 bg-[#060606] shadow-md cursor-pointer ${
                isActive ? "shadow-glow" : "hover:bg-white/5"
              }`}
            >
              {link.icon}
              <AnimatePresence>
                {isVisible && (
                  <motion.div
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: -10 }}
                    exit={{ opacity: 0, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 -translate-x-full mr-2 whitespace-nowrap rounded-md border border-neutral-700 bg-[#060606] px-2 py-1 text-xs text-white"
                  >
                    {link.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
