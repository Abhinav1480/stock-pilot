"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  formatter?: (val: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  formatter = (v) => v.toLocaleString(),
  duration = 1.2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
    duration,
  });

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(formatter(Math.round(latest)));
    });
    return unsubscribe;
  }, [springValue, formatter]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
