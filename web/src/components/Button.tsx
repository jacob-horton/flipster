import React, { ReactNode } from "react";
import { MouseEventHandler } from "react";

interface ButtonProps {
  children?: ReactNode;
  onClick?: MouseEventHandler;
}

const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button
      className="bg-gray-300 px-5 rounded-lg border border-black border-opacity-10"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
