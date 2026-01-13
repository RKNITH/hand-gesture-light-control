import React from 'react';
import { HiOutlineLightBulb } from 'react-icons/hi';

const LightBulb = ({ isOn, intensity }) => {
    return (
        <div className="relative">
            {/* Internal Glow Effect */}
            {isOn && (
                <div
                    className="absolute inset-0 bg-yellow-400 blur-3xl rounded-full animate-pulse transition-all"
                    style={{ opacity: intensity / 150 }}
                ></div>
            )}

            <HiOutlineLightBulb
                size={200}
                className={`relative z-10 transition-all duration-300 ${isOn ? 'text-yellow-400' : 'text-slate-800'
                    }`}
                style={{
                    filter: isOn ? `drop-shadow(0 0 ${intensity / 2}px rgba(250,204,21,0.8))` : 'none'
                }}
            />
        </div>
    );
};

export default LightBulb;