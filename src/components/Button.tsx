import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type ButtonProps = {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const Button = ({
  variant = "primary",
  isLoading = false,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`${
        variant === "primary"
          ? "bg-indigo-500 enabled:hover:bg-indigo-600 enabled:active:bg-indigo-500"
          : "bg-gray-500 enabled:hover:bg-gray-600 enabled:active:bg-gray-500"
      } flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-indigo-100 disabled:cursor-not-allowed ${
        className ?? ""
      }`}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 aspect-square w-4 animate-spin rounded-full border-2 border-solid border-gray-100 border-t-transparent" />
      ) : null}
      {props.children}
    </button>
  );
};

export default Button;
