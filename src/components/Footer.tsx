export default function Footer() {
  return (
    <footer
      className="w-full flex items-center justify-between px-5 py-3 border-t text-xs"
      style={{
        borderColor: '#334155',
        color: '#64748b',
      }}
    >
      <a
        href="https://www.linkedin.com/in/anthonysplendor/"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-[#14b8a6]"
        style={{ color: '#64748b' }}
      >
        Built by Anthony Splendor
      </a>
      <span style={{ color: '#64748b' }}>ProtoCompare™</span>
    </footer>
  );
}
