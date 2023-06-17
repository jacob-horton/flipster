import React, { ReactNode } from "react";
import { MouseEventHandler } from "react";

interface ButtonProps {
  children?: ReactNode;
  onClick?: MouseEventHandler;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className }) => {
  return (
    <div className={className}>
      <button
        className="bg-gray-300 px-5 rounded-lg border border-black border-opacity-10"
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

export default Button;
