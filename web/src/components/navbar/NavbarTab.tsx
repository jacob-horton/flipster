import Link from "next/link";
import { useRouter } from "next/router";

interface NavbarTabProps {
    selected: boolean;
    icon: React.ReactNode;
    name: string;
    path: string;
}

const NavbarTab: React.FC<NavbarTabProps> = ({
    selected,
    icon,
    name,
    path,
}) => {
    const router = useRouter();

    return (
        <Link
            key={path}
            href={path}
            onClick={() => {
                if (selected) {
                    router.reload();
                }
            }}
            className="flex flex-row items-center space-x-2"
        >
            <div className={selected ? "text-orange-400" : undefined}>
                {icon}
            </div>
            <p className={selected ? "text-orange-400" : undefined}>{name}</p>
        </Link>
    );
};

export default NavbarTab;
