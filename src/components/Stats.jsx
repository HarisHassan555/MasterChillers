import React, { useState, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

const Counter = ({ end, duration = 1 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const controls = useAnimation();
  const ref = React.useRef();
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      let startTime;
      let animationFrame;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);

        if (progress < 1) {
          setCount(Math.min(Math.floor(end * progress), end));
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(end);
          setHasAnimated(true);
        }
      };

      controls.start({ opacity: 1, y: 0 });
      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [isInView, end, duration, controls, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        transition={{ duration: 0.3 }}
      >
        <span className="text-red-500 text-5xl font-bold">
          {count}
        </span>
        {end === 200 && <span className="text-red-500 text-5xl font-bold">+</span>}
      </motion.div>
    </div>
  );
};

const Stats = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  return (
    <motion.div 
      {...fadeInUp}
      className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-16"
    >
      {/* Employee Count */}
      <div className="text-center">
        <Counter end={28} />
        <h3 className="text-2xl text-white font-semibold mt-4">Dedicated Employees</h3>
        <p className="text-gray-300 mt-2">Professional and skilled team members</p>
      </div>

      {/* Project Count */}
      <div className="text-center">
        <Counter end={200} />
        <h3 className="text-2xl text-white font-semibold mt-4">Projects Completed</h3>
        <p className="text-gray-300 mt-2">Successfully delivered projects</p>
      </div>
    </motion.div>
  );
};

export default Stats; 