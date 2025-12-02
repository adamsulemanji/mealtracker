"use client";

import React, { useEffect, useState } from "react";

interface Snowflake {
  id: number;
  left: string;
  animationDuration: string;
  opacity: number;
  size: string;
}

export function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const count = 50; // Number of snowflakes
    const newSnowflakes: Snowflake[] = [];

    for (let i = 0; i < count; i++) {
      newSnowflakes.push({
        id: i,
        left: `${Math.random() * 100}vw`,
        animationDuration: `${Math.random() * 3 + 2}s`, // 2-5 seconds
        opacity: Math.random(),
        size: `${Math.random() * 10 + 10}px`,
      });
    }

    setSnowflakes(newSnowflakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake absolute top-[-20px]"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            opacity: flake.opacity,
            fontSize: flake.size,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}
