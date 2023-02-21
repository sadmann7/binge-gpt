import { motion } from "framer-motion";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  DetailedHTMLProps,
} from "react";

// external imports
import { CheckCircle, PlusCircle } from "lucide-react";

type AddButtonProps = {
  isAdded: boolean;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  ComponentProps<typeof motion.button>;

const AddButton = ({ isAdded, className, ...props }: AddButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`aspect-square w-5 text-gray-900 ${className ?? ""}`}
      {...props}
    >
      {isAdded ? (
        <CheckCircle aria-hidden="true" />
      ) : (
        <PlusCircle aria-hidden="true" />
      )}
    </motion.button>
  );
};

export default AddButton;
