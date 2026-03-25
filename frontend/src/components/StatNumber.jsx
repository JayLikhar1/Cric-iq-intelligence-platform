/**
 * Glowing stat number. color = hex accent.
 */
export default function StatNumber({ value, label, color = '#0a84ff', size = 'lg' }) {
  const fontSize = size === 'xl' ? '32px' : size === 'lg' ? '24px' : size === 'md' ? '18px' : '15px'
  return (
    <div className="text-center">
      <div
        className="font-bold leading-none"
        style={{
          fontSize,
          color,
          textShadow: `0 0 20px ${color}70, 0 0 40px ${color}30`,
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value ?? '—'}
      </div>
      {label && (
        <div className="text-[10px] mt-1 uppercase tracking-widest font-medium" style={{ color: '#48484a' }}>
          {label}
        </div>
      )}
    </div>
  )
}
