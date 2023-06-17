import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/home" className="flex flex-row items-center space-x-2">
      <img src="/logo.svg" className="w-10 aspect-square" />
      <h1 className="text-purple-500 text-xl">flipster</h1>
    </Link>
  );
};

export default Logo;
