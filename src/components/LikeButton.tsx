import { motion } from "framer-motion";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  DetailedHTMLProps,
} from "react";

// external imports
import { CheckCircle, PlusCircle } from "lucide-react";

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
      animate={{ scale: isLiked ? 1.1 : 1 }}
      {...props}
    >
      {isLiked ? (
        <CheckCircle aria-hidden="true" className="text-green-600" />
      ) : (
        <PlusCircle aria-hidden="true" className="text-red-600" />
      )}
    </motion.button>
  );
};

export default LikeButton;
