interface HeaderProps {
    children?: string | string[];
}
const Header: React.FC<HeaderProps> = ({ children }) => {
    return <h1 className="text-4xl text-gray-800">{children}</h1>;
};

export default Header;
