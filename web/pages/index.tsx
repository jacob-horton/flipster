"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";

const Index = () => {
    const { push } = useRouter();

    useEffect(() => {
        push("/home");
    }, [push]);

    return <p></p>;
};

export default Index;
