import { useState } from "react";

interface FlipProps {
    term: string;
    definition: string;
}

export default function Flip({ term, definition }: FlipProps) {
    const [onTerm, setOnTerm] = useState(true);
    return (
        <div
            onClick={() => setOnTerm((prev) => !prev)}
            className="light-border m-4 flex grow items-center justify-center rounded-md bg-white p-4"
        >
            <span>{onTerm ? term : definition}</span>
        </div>
    );
}
