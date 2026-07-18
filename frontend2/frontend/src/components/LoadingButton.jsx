import { motion } from "framer-motion";

function LoadingButton({
  text,
  onClick,
  disabled,
}) {
  return (
    <motion.button
      whileHover={!disabled ? {
        scale: 1.02,
        y: -1,
      } : {}}
      whileTap={!disabled ? {
        scale: 0.98,
      } : {}}
      onClick={onClick}
      disabled={disabled}
      className="
      w-full
      py-4
      rounded-2xl
      font-semibold
      text-white
      bg-gradient-to-r
      from-accent
      to-accent-hover
      shadow-lg
      shadow-accent/20
      hover:shadow-accent/35
      disabled:opacity-50
      disabled:cursor-not-allowed
      transition-all
      duration-200
      cursor-pointer"
    >
      {text}
    </motion.button>
  );
}

export default LoadingButton;