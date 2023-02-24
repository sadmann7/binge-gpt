import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { forwardRef } from "react";

// external imports
import { Loader2 } from "lucide-react";
import DotsLoading from "./DotsLoading";

type ButtonProps = {
  variant?: "primary" | "secondary" | "tertiary";
  isLoading?: boolean;
  loadingVariant?: "spinner" | "dots";
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      isLoading = false,
      loadingVariant = "spinner",
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={`${
          variant === "primary"
            ? "bg-indigo-600 text-white enabled:hover:bg-indigo-700 enabled:active:bg-indigo-600"
            : variant === "secondary"
            ? "bg-gray-500 text-gray-900 enabled:hover:bg-gray-600 enabled:active:bg-gray-500"
            : "bg-gray-200 text-gray-900 enabled:hover:bg-gray-300 enabled:active:bg-gray-200"
        } flex h-10 w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-indigo-100 disabled:cursor-not-allowed disabled:bg-opacity-80 ${
          className ?? ""
        }`}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          loadingVariant === "spinner" ? (
            <Loader2 className="mr-2 aspect-square w-4 animate-spin" />
          ) : (
            <DotsLoading />
          )
        ) : null}
        {isLoading
          ? loadingVariant === "spinner"
            ? "Loading..."
            : null
          : props.children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
