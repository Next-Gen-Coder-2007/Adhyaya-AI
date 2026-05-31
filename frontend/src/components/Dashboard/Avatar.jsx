export const Avatar = ({ name = 'U', size = 9 }) => (
  <div
    style={{
      width: `${size * 0.25}rem`,  // Convert size to rem (e.g., size=8 → 2rem)
      height: `${size * 0.25}rem`,
    }}
    className="rounded-full bg-gradient-to-br from-amber-500 to-yellow-700
              flex items-center justify-center text-black font-bold text-sm shrink-0"
  >
    {name.charAt(0).toUpperCase()}
  </div>
);