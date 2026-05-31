import logo from '../assets/logo.png'

const Loader = () => (
  <div className="fixed inset-0 z-[9999] overflow-hidden bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-7">
      <div className="relative w-18 h-18">
        <div
          className="w-18 h-18 rounded-full border-2 border-yellow-900/20 border-t-yellow-600 border-r-yellow-800 animate-spin"
          style={{ width: 72, height: 72 }}
        />
        <div
          className="absolute top-2.5 left-2.5 rounded-full border border-yellow-900/20 border-b-yellow-600 animate-spin"
          style={{
            width: 52,
            height: 52,
            animationDuration: "0.7s",
            animationDirection: "reverse",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-yellow-600">
          <img src={logo}  />
        </div>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-bounce"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1.2s",
            }}
          />
        ))}
      </div>
      <p className="text-xs tracking-widest uppercase text-gray-600">
        Loading
      </p>
    </div>
  </div>
);

export default Loader;