interface SkipLinkProps {
  targetId: string
  children?: string
}

export default function SkipLink({ targetId, children = 'Langsung ke konten utama' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[100]
        px-4 py-2 bg-primary-600 text-white
        rounded-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        transition-transform
      "
    >
      {children}
    </a>
  )
}
