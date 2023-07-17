import Link from "next/link";

const Logo = () => {
    return (
        <Link href="/home" className="flex flex-row items-center space-x-2">
            <img src="/logo.svg" className="aspect-square w-10" />
            <h1 className="text-xl text-purple-500">flipster</h1>
        </Link>
    );
};

export default Logo;
