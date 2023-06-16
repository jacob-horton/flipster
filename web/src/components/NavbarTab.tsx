interface NavbarTabProps {
  selected: boolean;
  name: string;
  onClick: () => void;
}

const NavbarTab: React.FC<NavbarTabProps> = ({ selected, name, onClick }) => {
  return (
    <button className="flex flex-row items-center space-x-2" onClick={onClick}>
      <div
        className={`w-8 h-8 ${selected ? "bg-orange-400" : "bg-gray-400"}`}
      />
      <p className={selected ? "text-orange-400" : undefined}>{name}</p>
    </button>
  );
};

export default NavbarTab;
