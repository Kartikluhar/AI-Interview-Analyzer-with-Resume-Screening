import { motion } from "framer-motion";

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-96 h-96 bg-accent/15 blur-[120px] rounded-full top-[-10%] left-[-10%]"
      />

      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full bottom-[-10%] right-[-10%]"
      />
    </div>
  );
}

export default AnimatedBackground;