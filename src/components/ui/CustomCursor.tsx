import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 250 };
  const trailX = useSpring(mouseX, springConfig);
  const trailY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // mouseX/mouseY are motion values (set imperatively, no re-render). We only
    // flip the React `isVisible`/`isHovering` state on actual changes, and we read
    // the latest visibility via a ref so this effect runs once (stable listeners).
    let visible = false;
    const setVisibleOnce = (v: boolean) => {
      if (visible === v) return;
      visible = v;
      setIsVisible(v);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisibleOnce(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = !!(
        target.closest('a, button, input, textarea, [role="button"]')
      );
      setIsHovering(isInteractive);
    };

    const handleMouseLeaveWindow = () => setVisibleOnce(false);
    const handleMouseEnterWindow = () => setVisibleOnce(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden md:block">
      <motion.div
        className="w-1.5 h-1.5 bg-indigo-500 rounded-full fixed top-0 left-0"
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="w-7 h-7 border border-indigo-500/50 rounded-full fixed top-0 left-0"
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
          borderColor: isHovering ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 0.4)',
        }}
        style={{ x: trailX, y: trailY, translateX: '-50%', translateY: '-50%' }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};
