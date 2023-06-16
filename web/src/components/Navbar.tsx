import { useState } from "react";
import NavbarTab from "./NavbarTab";
import Logo from "./Logo";
import Profile from "./Profile";

const Navbar = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const names = ["Home", "Review", "Files", "Groups"];

  return (
    <div className="w-full flex flex-row items-center justify-between">
      <div className="flex flex-row space-x-4">
        <Logo />
        {names.map((name, i) => (
          <NavbarTab
            key={i}
            name={name}
            selected={selectedIndex === i}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>
      <Profile />
    </div>
  );
};

export default Navbar;
