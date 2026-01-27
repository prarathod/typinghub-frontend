import { useState, useRef, useEffect } from "react";

import heroIntroJpeg from "@/assets/heroIntro.jpeg";
import heroIntroMp4 from "@/assets/heroIntro.mp4";

export function HeroSection() {
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setVideoReady(true);

    video.addEventListener("canplaythrough", handleCanPlay);
    return () => video.removeEventListener("canplaythrough", handleCanPlay);
  }, []);

  return (
    <section className="hero-section w-100 overflow-hidden position-relative bg-dark">
      {/* JPEG shown initially while video loads */}
      <img
        src={heroIntroJpeg}
        alt="Intro"
        className="hero-section-media position-absolute top-0 start-0 w-100 h-100"
        style={{
          opacity: videoReady ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
          zIndex: videoReady ? 0 : 1,
        }}
      />
      {/* MP4 plays once loaded */}
      <video
        ref={videoRef}
        src={heroIntroMp4}
        poster={heroIntroJpeg}
        preload="auto"
        autoPlay
        muted
        loop
        playsInline
        className="hero-section-media position-absolute top-0 start-0 w-100 h-100"
        style={{
          opacity: videoReady ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
          zIndex: 1,
        }}
      />
    </section>
  );
}
