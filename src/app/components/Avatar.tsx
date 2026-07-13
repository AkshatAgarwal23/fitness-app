interface AvatarProps {
  name: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, size = 64 }: AvatarProps) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-medium"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: 'rgba(29, 158, 117, 0.12)',
        color: 'var(--accent)',
        border: '1px solid rgba(29, 158, 117, 0.25)',
        boxShadow: '0 0 20px rgba(29, 158, 117, 0.1)',
      }}
    >
      {getInitials(name)}
    </div>
  );
}
