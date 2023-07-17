import React, { ReactNode } from "react";
import { MouseEventHandler } from "react";

interface ButtonProps {
    children?: ReactNode;
    onClick?: MouseEventHandler;
    className?: string;
    submit?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    className,
    submit,
}) => {
    return (
        <div className={className}>
            <button
                type={submit ? "submit" : "button"}
                className="light-border rounded-lg bg-gray-300 px-5"
                onClick={onClick}
            >
                {children}
            </button>
        </div>
    );
};

export default Button;
