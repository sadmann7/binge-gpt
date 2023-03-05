import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  DetailedHTMLProps,
} from "react";

type LikeButtonProps = {
  isLiked: boolean;
  likeCount: number;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  ComponentProps<typeof motion.button>;

const LikeButton = ({
  isLiked,
  likeCount,
  className = "",
  disabled,
  ...props
}: LikeButtonProps) => {
  return (
    <div className="flex items-center gap-2.5">
      <motion.button
        className={`h-5 w-5 disabled:pointer-events-none disabled:opacity-80 ${className}`}
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        disabled={disabled}
        {...props}
      >
        <Heart
          aria-hidden="true"
          className={`text-red-600 ${isLiked ? "fill-current" : ""}`}
        />
      </motion.button>
      {likeCount > 0 ? (
        <span className="text-sm font-semibold text-white">{likeCount}</span>
      ) : null}
    </div>
  );
};

export default LikeButton;
