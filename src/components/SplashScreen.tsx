import { useEffect, useState } from 'react';
import logo from '@/assets/logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [animationState, setAnimationState] = useState<'zoom-in' | 'zoom-out' | 'fade-out'>('zoom-in');

  useEffect(() => {
    // Zoom in animation (0-800ms)
    const zoomInTimer = setTimeout(() => {
      setAnimationState('zoom-out');
    }, 800);

    // Zoom out animation (800-1400ms)
    const zoomOutTimer = setTimeout(() => {
      setAnimationState('fade-out');
    }, 1400);

    // Fade out and complete (1400-1800ms)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => {
      clearTimeout(zoomInTimer);
      clearTimeout(zoomOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Logo Container */}
      <div className="relative flex flex-col items-center gap-4">
        {/* Logo with Animation */}
        <div
          className={`
            transition-all duration-700 ease-out
            ${animationState === 'zoom-in' ? 'scale-0 opacity-0' : ''}
            ${animationState === 'zoom-out' ? 'scale-150 opacity-100' : ''}
            ${animationState === 'fade-out' ? 'scale-100 opacity-0' : ''}
          `}
        >
          <img
            src={logo}
            alt="لمسة الجمال | Lamset Beauty"
            className="w-40 h-40 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Store Name Animation */}
        <div
          className={`
            flex flex-col items-center gap-1 transition-all duration-500 delay-300
            ${animationState === 'zoom-in' ? 'opacity-0 translate-y-4' : ''}
            ${animationState === 'zoom-out' ? 'opacity-100 translate-y-0' : ''}
            ${animationState === 'fade-out' ? 'opacity-0' : ''}
          `}
        >
          <h1 className="text-3xl font-bold text-primary">لمسة الجمال</h1>
          <p className="text-sm text-muted-foreground font-medium">Lamset Beauty</p>
        </div>

        {/* Loading Indicator */}
        <div
          className={`
            mt-4 transition-all duration-300 delay-500
            ${animationState === 'zoom-out' ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
