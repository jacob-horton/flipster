import NavbarTab from "./NavbarTab";
import Logo from "./Logo";
import Profile from "./Profile";
import { useRouter } from "next/router";

import { HiOutlineHome } from "react-icons/hi";
import { BsBook } from "react-icons/bs";
import { AiOutlineFileText } from "react-icons/ai";
import { GrGroup } from "react-icons/gr";

const Navbar = () => {
    const tabs = [
        {
            icon: <HiOutlineHome />,
            name: "Home",
        },
        {
            icon: <BsBook />,
            name: "Review",
        },
        {
            icon: <AiOutlineFileText />,
            name: "Files",
        },
        {
            icon: <GrGroup />,
            name: "Groups",
        },
    ];
    const { route } = useRouter();

    return (
        <header className="w-full flex flex-row items-center justify-between bg-white border-black border-[1.5px] border-opacity-10 rounded-b-lg">
            <div className="flex flex-row space-x-4 p-2">
                <Logo />
                {tabs.map(({ icon, name }) => {
                    const path = `/${name.toLowerCase()}`;
                    return (
                        <NavbarTab
                            key={path}
                            name={name}
                            icon={icon}
                            selected={route === path}
                            path={path}
                        />
                    );
                })}
            </div>
            <Profile />
        </header>
    );
};

export default Navbar;
