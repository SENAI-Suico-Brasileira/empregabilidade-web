export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <a
        href="https://www.linkedin.com/in/lucascorreaa/"
        target="_blank"
        rel="noopener noreferrer"
        className="site-footer-link"
        aria-label="Perfil de Lucas Corrêa no LinkedIn"
      >
        <span>Prof. Lucas Corrêa</span>
        <svg
          className="site-footer-icon"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/>
        </svg>
      </a>
    </footer>
  );
}
