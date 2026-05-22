import { BRAND } from "../brand";

/**
 * Logo do Portal — monograma "SB" + wordmark.
 *
 * Props:
 *   size      → altura em px (default 36)
 *   variant   → "default" (vermelho em fundo claro) | "white" (uso em fundo escuro/colorido)
 *   showText  → exibe o nome ao lado do monograma (default true)
 */
export default function BrandLogo({ size = 36, variant = "default", showText = true }) {
  const isWhite = variant === "white";
  const markBg     = isWhite ? "#FFFFFF" : BRAND.colors.primary;
  const markFg     = isWhite ? BRAND.colors.primary : "#FFFFFF";
  const textColor  = isWhite ? "#FFFFFF" : BRAND.colors.primary;
  const subColor   = isWhite ? "rgba(255,255,255,0.85)" : "#4B5563";

  const viewW = showText ? 200 : 60;

  return (
    <svg
      width={(size * viewW) / 60}
      height={size}
      viewBox={`0 0 ${viewW} 60`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={BRAND.fullName}
    >
      {/* Monograma "SB" em quadrado arredondado */}
      <rect x="2" y="4" width="52" height="52" rx="10" fill={markBg} />
      <text
        x="28"
        y="41"
        textAnchor="middle"
        fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
        fontWeight="800"
        fontSize="26"
        fill={markFg}
        letterSpacing="-0.5"
      >
        {BRAND.monogram}
      </text>

      {showText && (
        <>
          {/* Wordmark "Portal de" */}
          <text
            x="66"
            y="30"
            fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
            fontWeight="500"
            fontSize="11"
            fill={subColor}
            letterSpacing="0.6"
          >
            PORTAL DE
          </text>
          {/* Wordmark "Empregabilidade" */}
          <text
            x="66"
            y="48"
            fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
            fontWeight="800"
            fontSize="18"
            fill={textColor}
            letterSpacing="-0.3"
          >
            Empregabilidade
          </text>
        </>
      )}
    </svg>
  );
}
