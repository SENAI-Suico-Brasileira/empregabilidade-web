/**
 * Logo do SENAI como componente SVG.
 * Aceita `size` (height em px) e `variant`:
 *   "default"  → wordmark vermelho (uso em fundo claro)
 *   "white"    → wordmark branco  (uso em fundo escuro/colorido)
 *
 * Para substituir por um arquivo .svg externo no futuro,
 * basta trocar o conteúdo deste componente — a interface não muda.
 */
export default function SenaiLogo({ size = 36, variant = "default" }) {
  const wordmarkColor = variant === "white" ? "#FFFFFF" : "#E30613";
  const subtitleColor = variant === "white" ? "rgba(255,255,255,0.85)" : "#4B5563";

  return (
    <svg
      width={size * 3.2}
      height={size}
      viewBox="0 0 192 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SENAI Suiço-Brasileira"
      role="img"
    >
      {/* Bloco vermelho à esquerda */}
      <rect x="0" y="4" width="8" height="52" rx="2" fill={wordmarkColor} />

      {/* Wordmark "SENAI" */}
      <text
        x="16"
        y="38"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="32"
        fill={wordmarkColor}
        letterSpacing="-0.5"
      >
        SENAI
      </text>

      {/* Subtítulo "Suiço-Brasileira" */}
      <text
        x="17"
        y="54"
        fontFamily="Arial, sans-serif"
        fontWeight="400"
        fontSize="11"
        fill={subtitleColor}
        letterSpacing="0.3"
      >
        Suiço-Brasileira
      </text>
    </svg>
  );
}
