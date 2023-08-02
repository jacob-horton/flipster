import { Dispatch, SetStateAction } from "react";
import ListViewNode from "./ListViewNode";
import { Folder } from "@src/types/Folder";

interface FolderListViewProps {
    selectMultiple: boolean;
    selected: number[];
    setSelected?: Dispatch<SetStateAction<number[]>>;
    rootFolder: Folder;
}

const FolderListView: React.FC<FolderListViewProps> = ({
    selectMultiple,
    selected,
    setSelected,
    rootFolder,
}) => {
    if (rootFolder?.id === undefined) {
        return <p>Loading</p>;
    } else {
        return (
            <ListViewNode
                node={{
                    id: rootFolder.id,
                    name: rootFolder.name,
                    children: [],
                }}
                expanded={true}
                path={[]}
                selected={selected}
                setSelected={(id: number) => {
                    if (!setSelected) return;
                    if (selectMultiple) {
                        if (selected.includes(id)) {
                            setSelected((selected) =>
                                selected.filter((i) => i != id)
                            );
                        } else {
                            setSelected((selected) => [...selected, id]);
                        }
                    } else {
                        setSelected([id]);
                    }
                }}
            />
        );
    }
};

export default FolderListView;
