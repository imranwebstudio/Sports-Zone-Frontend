import { motion } from 'framer-motion';

function Football({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#f8fafc" stroke="#1e293b" strokeWidth="4" />
      {/* top pentagon */}
      <polygon points="50,10 63,21 58,36 42,36 37,21" fill="#1e293b" />
      {/* left pentagon */}
      <polygon points="14,38 26,28 37,36 34,52 18,57" fill="#1e293b" />
      {/* right pentagon */}
      <polygon points="86,38 74,28 63,36 66,52 82,57" fill="#1e293b" />
      {/* bottom-left pentagon */}
      <polygon points="18,65 34,60 37,76 24,87 10,76" fill="#1e293b" />
      {/* bottom-right pentagon */}
      <polygon points="82,65 66,60 63,76 76,87 90,76" fill="#1e293b" />
      {/* bottom pentagon */}
      <polygon points="50,90 37,76 42,60 58,60 63,76" fill="#1e293b" />
    </svg>
  );
}

type LoaderProps = {
  text?: string;
  fullscreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function Loader({ text, fullscreen = false, size = 'md' }: LoaderProps) {
  const ballSize  = size === 'sm' ? 36  : size === 'lg' ? 80 : 56;
  const dotSize   = size === 'sm' ? 13  : size === 'lg' ? 22 : 17;
  const padClass  = size === 'sm' ? 'py-8' : size === 'lg' ? 'py-24' : 'py-16';

  const inner = (
    <div className={`flex flex-col items-center gap-6 ${fullscreen ? '' : padClass}`}>
      {/* spinning main ball */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
        style={{ willChange: 'transform' }}
      >
        <Football size={ballSize} />
      </motion.div>

      {/* 4 bouncing mini balls — wave sequence */}
      <div className="flex gap-3 items-end" style={{ height: dotSize + 14 }}>
        {[0, 0.14, 0.28, 0.42].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -(dotSize * 0.7), 0] }}
            transition={{ duration: 0.55, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Football size={dotSize} />
          </motion.div>
        ))}
      </div>

      {text && (
        <p className="text-sm font-medium text-dark-500 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/75 backdrop-blur-sm">
        {inner}
      </div>
    );
  }

  return <div className="flex w-full items-center justify-center">{inner}</div>;
}
