import React, { ReactNode } from "react";
import { MouseEventHandler } from "react";

interface ButtonProps {
    children?: ReactNode;
    onClick?: MouseEventHandler;
    className?: string;
}

// TODO: use styling
const Button: React.FC<ButtonProps> = ({ children, onClick, className }) => {
    return (
        <div className={className}>
            <button
                className="light-border rounded-lg bg-gray-300 px-5"
                onClick={onClick}
            >
                {children}
            </button>
        </div>
    );
};

export default Button;
