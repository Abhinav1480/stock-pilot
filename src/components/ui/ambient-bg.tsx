"use client";

export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Primary violet orb — top left */}
      <div
        className="float-orb"
        style={{
          width: "600px",
          height: "600px",
          top: "-200px",
          left: "-150px",
          background:
            "radial-gradient(circle, oklch(0.623 0.263 264.376 / 12%) 0%, transparent 70%)",
          "--float-duration": "14s",
          animationDelay: "0s",
        } as React.CSSProperties}
      />

      {/* Purple orb — top right */}
      <div
        className="float-orb"
        style={{
          width: "500px",
          height: "500px",
          top: "-100px",
          right: "-100px",
          background:
            "radial-gradient(circle, oklch(0.627 0.265 303.9 / 10%) 0%, transparent 70%)",
          "--float-duration": "18s",
          animationDelay: "-6s",
        } as React.CSSProperties}
      />

      {/* Teal orb — bottom center */}
      <div
        className="float-orb"
        style={{
          width: "400px",
          height: "400px",
          bottom: "10%",
          left: "40%",
          background:
            "radial-gradient(circle, oklch(0.696 0.17 162.48 / 7%) 0%, transparent 70%)",
          "--float-duration": "22s",
          animationDelay: "-10s",
        } as React.CSSProperties}
      />
    </div>
  );
}
