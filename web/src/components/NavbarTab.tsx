import Link from "next/link";

interface NavbarTabProps {
  selected: boolean;
  name: string;
  path: string;
}

const NavbarTab: React.FC<NavbarTabProps> = ({ selected, name, path }) => {
  return (
    <Link href={path} className="flex flex-row items-center space-x-2">
      <div
        className={`w-8 h-8 ${selected ? "bg-orange-400" : "bg-gray-400"}`}
      />
      <p className={selected ? "text-orange-400" : undefined}>{name}</p>
    </Link>
  );
};

export default NavbarTab;
