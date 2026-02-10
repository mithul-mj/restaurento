import React, { useState, useEffect, useMemo } from 'react';

const LOADER_STYLES = `
  @keyframes pot-bounce {
    0%, 100% { transform: translateY(0) scale(1, 1); }
    40% { transform: translateY(-12px) scale(0.92, 1.08); }
    50% { transform: translateY(0) scale(1.1, 0.9); }
  }
  @keyframes lid-dance {
    0%, 20% { transform: translateY(0) rotate(0); }
    5%, 15% { transform: translateY(-4px) rotate(-4deg); }
    10% { transform: translateY(-4px) rotate(4deg); }
    35% { transform: translateY(-30px) translateX(15px) rotate(25deg); }
    75% { transform: translateY(-30px) translateX(15px) rotate(25deg); }
    90%, 100% { transform: translateY(0) rotate(0); }
  }
  @keyframes steam-rise-right {
    0%, 30% { opacity: 0; transform: translateY(20px) translateX(0) scale(0.5); }
    45% { opacity: 0.8; }
    85% { opacity: 0; transform: translateY(-80px) translateX(40px) scale(2); }
    100% { opacity: 0; }
  }
  @keyframes shadow-pulse {
    0%, 100% { transform: scale(1); opacity: 0.2; }
    40% { transform: scale(0.8); opacity: 0.1; }
    50% { transform: scale(1.1); opacity: 0.25; }
  }
  .animate-pot { 
    animation: pot-bounce 1.8s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95); 
    transform-origin: center bottom;
    transform-box: fill-box;
  }
  .animate-lid { 
    animation: lid-dance 1.8s infinite ease-in-out; 
    transform-origin: right center; 
    transform-box: fill-box;
  }
  .animate-steam { 
    animation: steam-rise-right 1.8s infinite ease-out; 
    opacity: 0; 
  }
  .animate-shadow { 
    animation: shadow-pulse 1.8s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95); 
    transform-origin: center; 
  }
`;

const STEAM_WISPS = [
    { d: "M70,95 C60,75 80,65 70,45", delay: "0.6s" },
    { d: "M90,90 C80,70 100,60 90,40", delay: "0.8s" },
    { d: "M110,95 C100,75 120,65 110,45", delay: "1.0s" },
];

const PotLoader = ({ text = "Preparing", size = "medium", showText = true }) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        if (!showText) return;
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 400);
        return () => clearInterval(interval);
    }, [showText]);

    const { scale, fontSize } = useMemo(() => {
        if (typeof size === 'number') {
            return { scale: size, fontSize: 'text-[10px]' };
        }

        const config = {
            xs: { scale: 0.12, font: 'text-[8px]' },
            sm: { scale: 0.3, font: 'text-[10px]' },
            small: { scale: 0.3, font: 'text-[10px]' },
            medium: { scale: 0.5, font: 'text-xs' },
            large: { scale: 1, font: 'text-sm' }
        };

        const current = config[size] || config.medium;
        return { scale: current.scale, fontSize: current.font };
    }, [size]);

    const containerStyle = useMemo(() => ({
        width: `${192 * scale}px`,
        height: `${200 * scale}px`
    }), [scale]);

    const potWrapperStyle = useMemo(() => ({
        width: '192px',
        height: '224px',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: '-96px'
    }), [scale]);

    return (
        <div className="flex flex-col items-center justify-center font-sans select-none">
            <style>{LOADER_STYLES}</style>
            <div className="relative overflow-visible shrink-0" style={containerStyle}>
                <div style={potWrapperStyle}>
                    <div className="relative h-[80%] w-full flex items-center justify-center">
                        <div className="absolute bottom-4 flex justify-center w-full">
                            <svg className="w-[33%] h-auto" viewBox="0 0 120 30">
                                <ellipse cx="60" cy="15" rx="40" ry="6" className="animate-shadow fill-black" />
                            </svg>
                        </div>
                        <svg viewBox="0 -100 240 300" width="100%" height="100%" className="relative z-10 pointer-events-none overflow-visible">
                            {STEAM_WISPS.map((wisp, i) => (
                                <path
                                    key={i}
                                    d={wisp.d}
                                    className="animate-steam fill-none stroke-slate-300 stroke-[6]"
                                    style={{ animationDelay: wisp.delay, strokeLinecap: 'round' }}
                                />
                            ))}
                            <g className="animate-pot">
                                <rect x="25" y="110" width="20" height="12" rx="6" className="fill-slate-900" />
                                <rect x="155" y="110" width="20" height="12" rx="6" className="fill-slate-900" />
                                <path d="M45,95 L155,95 L148,160 C145,175 135,180 100,180 C65,180 55,175 52,160 Z" className="fill-slate-800" />
                                <rect x="42" y="95" width="116" height="10" rx="5" className="fill-slate-900" />
                                <g className="animate-lid">
                                    <path d="M45,95 C45,75 155,75 155,95 L45,95" className="fill-slate-600" />
                                    <circle cx="100" cy="73" r="10" className="fill-slate-900" />
                                    <path d="M65,90 C65,82 135,82 135,90" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="3" strokeLinecap="round" />
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
            {showText && (
                <div className={`mt-1 flex justify-center w-full ${fontSize}`}>
                    <div className="text-slate-800 font-bold tracking-widest uppercase flex items-center h-4">
                        <span className="shrink-0">{text}</span>
                        <span className="inline-block w-4 text-left tabular-nums">{dots}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PotLoader;
