import type { CSSProperties } from "react";

const LETTERS = ["N", "E", "X", "O", "R"] as const;

function BrandGlyph({ letter }: { letter: (typeof LETTERS)[number] }) {
  return (
    <span className="nexor-type-glyph" aria-hidden="true">
      {letter}
    </span>
  );
}

export default function NexorWordmark({ variant }: { variant: "hero" | "intro" }) {
  if (variant === "hero") {
    return (
      <>
        {LETTERS.map((letter) => (
          <span className="hw-mask" key={letter}>
            <span className="hw-letter">
              <BrandGlyph letter={letter} />
            </span>
          </span>
        ))}
      </>
    );
  }

  return (
    <>
      {LETTERS.map((letter, index) => (
        <span
          className={`intro-glyph-slot${index % 2 === 1 ? " intro-glyph-slot-lower" : ""}`}
          key={letter}
          style={
            {
              "--intro-column": index + 1,
              "--intro-row": index % 2 === 1 ? 2 : 1,
            } as CSSProperties
          }
        >
          <span className="intro-glyph" style={{ "--intro-index": index + 1 } as CSSProperties}>
            <BrandGlyph letter={letter} />
          </span>
        </span>
      ))}
    </>
  );
}
