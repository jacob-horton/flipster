import NavbarTab from "./NavbarTab";
import Logo from "./Logo";
import Profile from "./Profile";
import { useRouter } from "next/router";

import { HiOutlineHome } from "react-icons/hi";
import { BsBook, BsPeople } from "react-icons/bs";
import { AiOutlineFileText } from "react-icons/ai";

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
            icon: <BsPeople />,
            name: "Groups",
        },
    ];
    const { route } = useRouter();

    return (
        <nav className="flex flex-row items-center justify-between bg-white rounded-b-lg light-border">
            <div className="flex flex-row space-x-4 p-2">
                <div className="pr-4">
                    <Logo />
                </div>
                {tabs.map(({ icon, name }) => {
                    const path = `/${name.toLowerCase()}`;
                    return (
                        <NavbarTab
                            key={path}
                            name={name}
                            icon={icon}
                            selected={
                                route.split("/")[1] === name.toLowerCase()
                            }
                            path={path}
                        />
                    );
                })}
            </div>
            <Profile />
        </nav>
    );
};

export default Navbar;
