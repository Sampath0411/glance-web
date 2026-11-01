type ArrowDirection = "up-right" | "down" | "right";

export function ArrowIcon({ direction = "up-right" }: { direction?: ArrowDirection }) {
  const paths: Record<ArrowDirection, string> = {
    "up-right": "M7 17 17 7M8 7h9v9",
    down: "M12 4v15m-6-6 6 6 6-6",
    right: "M5 12h14m-6-6 6 6-6 6",
  };

  return <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[direction]} /></svg>;
}
