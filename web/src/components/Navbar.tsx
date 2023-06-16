import { useState } from "react";
import NavbarTab from "./NavbarTab";

const Navbar = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const names = ["Home", "Review", "Files", "Groups"]

    return <div className="w-full flex flex-row space-x-4">
        {names.map((name, i) => 
            <NavbarTab name={name} selected={selectedIndex === i} onClick={() => setSelectedIndex(i)}/>
        )}
    </div>;
}

export default Navbar;