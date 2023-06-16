import { ReactNode } from "react";

interface HeaderProps {
  children: ReactNode;
}
const Header: React.FC<HeaderProps> = ({ children }) => {
  return <h1 className="text-4xl">{children}</h1>;
};

export default Header;
