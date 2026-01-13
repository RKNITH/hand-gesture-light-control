import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import LightBulb from './components/LightBulb';

function App() {
  const [brightness, setBrightness] = useState(0);
  const [cameraLoaded, setCameraLoaded] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // Finger detection logic
        const fingerTips = [8, 12, 16, 20];
        const fingerBase = [6, 10, 14, 18];
        let count = 0;

        fingerTips.forEach((tip, index) => {
          if (landmarks[tip].y < landmarks[fingerBase[index]].y) {
            count++;
          }
        });

        // Thumb check
        if (Math.abs(landmarks[4].x - landmarks[2].x) > 0.1) {
          count++;
        }

        // FIST = 100%, FINGERS = 20% each
        if (count === 0) {
          setBrightness(100);
        } else {
          setBrightness(count * 20);
        }
      } else {
        setBrightness(0);
      }
    });

    if (webcamRef.current && webcamRef.current.video) {
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setCameraLoaded(true);
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-500 bg-slate-950`}>

      {/* --- LIVE CAMERA PREVIEW (TOP RIGHT) --- */}
      <div className="fixed top-6 right-6 w-64 h-48 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-50 group hover:border-yellow-500 transition-all">
        <Webcam
          ref={webcamRef}
          mirrored={true} // Mirrored looks more natural
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-[10px] text-white px-3 py-1 rounded-full font-mono">
          {cameraLoaded ? "AI SENSOR: ACTIVE" : "CONNECTING..."}
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-5xl font-black mb-2 text-white tracking-tighter uppercase italic">
          Force Dimmer
        </h1>
        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">
          {brightness > 0 ? `Current Power: ${brightness}%` : "Show your hand to start"}
        </p>
      </div>

      <div className="relative">
        {/* Visual Glow behind the bulb based on brightness */}
        <div
          className="absolute inset-0 bg-yellow-400 rounded-full transition-all duration-300 opacity-20"
          style={{ filter: `blur(${brightness}px)`, transform: `scale(${brightness / 50})` }}
        ></div>

        <LightBulb isOn={brightness > 0} intensity={brightness} />
      </div>

      {/* Progress Bar for Intensity */}
      <div className="mt-16 w-80">
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-widest">
          <span>0%</span>
          <span>Intensity Meter</span>
          <span>100%</span>
        </div>
        <div className="h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
          <div
            className="h-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] transition-all duration-300"
            style={{ width: `${brightness}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default App;