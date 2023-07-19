import Link from "next/link";
import React, { ReactNode } from "react";
import { MouseEventHandler } from "react";

interface LinkButtonProps {
    href: string;
    query: {
        [param: string]: string | string[] | boolean;
    };
    onClick?: MouseEventHandler;
    children?: ReactNode;
}

interface DefaultButtonProps {
    onClick?: MouseEventHandler;
    children?: ReactNode;
    type?: "button" | "submit" | "reset";
}

type ButtonProps = LinkButtonProps | DefaultButtonProps;

function isLinkButton(obj: ButtonProps): obj is LinkButtonProps {
    return "href" in obj;
}

const Button: React.FC<ButtonProps> = (props) => {
    const { onClick, children } = props;
    return (
        <>
            {!isLinkButton(props) ? (
                <button
                    className="light-border rounded-lg bg-gray-300 px-5"
                    onClick={onClick}
                    type={props.type}
                >
                    {children}
                </button>
            ) : (
                <Link
                    className="light-border rounded-lg bg-gray-300 px-5"
                    href={{ pathname: props.href, query: props.query }}
                >
                    {children}
                </Link>
            )}
        </>
    );
};

export default Button;
