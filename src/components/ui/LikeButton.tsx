import { motion } from "framer-motion";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  DetailedHTMLProps,
} from "react";

// external imports
import { Heart } from "lucide-react";

type LikeButtonProps = {
  isLiked: boolean;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  ComponentProps<typeof motion.button>;

const LikeButton = ({ isLiked, className, ...props }: LikeButtonProps) => {
  return (
    <motion.button
      className={`aspect-square w-5 ${className ?? ""}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      {...props}
    >
      {isLiked ? (
        <Heart aria-hidden="true" className="fill-current text-red-600" />
      ) : (
        <Heart aria-hidden="true" className="text-red-600" />
      )}
    </motion.button>
  );
};

export default LikeButton;
