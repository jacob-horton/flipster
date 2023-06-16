import NavbarTab from "./NavbarTab";
import Logo from "./Logo";
import Profile from "./Profile";
import { useRouter } from "next/router";

const Navbar = () => {
  const names = ["Home", "Review", "Files", "Groups"];
  const { asPath } = useRouter();

  return (
    <div className="w-full flex flex-row items-center justify-between bg-white border-black border-[1.5px] border-opacity-10 rounded-b-lg">
      <div className="flex flex-row space-x-4 p-2">
        <Logo />
        {names.map((name, i) => {
          const path = `/${name.toLowerCase()}`;
          return (
            <NavbarTab
              key={i}
              name={name}
              selected={asPath === path}
              path={path}
            />
          );
        })}
      </div>
      <Profile />
    </div>
  );
};

export default Navbar;
