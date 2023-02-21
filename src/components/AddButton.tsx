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
      className={`aspect-square w-5 ${className ?? ""}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      {...props}
    >
      {isAdded ? (
        <CheckCircle aria-hidden="true" className="text-green-600" />
      ) : (
        <PlusCircle aria-hidden="true" className="text-red-600" />
      )}
    </motion.button>
  );
};

export default AddButton;
