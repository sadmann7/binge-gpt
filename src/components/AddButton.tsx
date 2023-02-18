import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

// external imports
import { CheckCircleIcon, PlusCircleIcon } from "lucide-react";

type AddButtonProps = {
  isAdded: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  ComponentProps<typeof motion.button>;

const AddButton = ({ isAdded, className, ...props }: AddButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={className}
      animate={{ scale: isAdded ? 1.1 : 1 }}
      {...props}
    >
      {isAdded ? (
        <CheckCircleIcon className="text-red-500" size={18} />
      ) : (
        <PlusCircleIcon className="text-red-500" size={18} />
      )}
    </motion.button>
  );
};

export default AddButton;
