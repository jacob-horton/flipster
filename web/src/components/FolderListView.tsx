import { useEffect, useState } from "react";
import ListViewNode from "./ListViewNode";
import { Folder } from "@src/types/Folder";

interface FolderListViewProps {
    selectMultiple: boolean;
    onSelectedFoldersChange?: (folderIds: number[]) => void;
    rootFolder: Folder;
}

const FolderListView: React.FC<FolderListViewProps> = ({
    selectMultiple,
    onSelectedFoldersChange,
    rootFolder,
}) => {
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => {
        // NOTE: must be useCallback, otherwise it will rerender constantly. enforce?
        if (onSelectedFoldersChange) onSelectedFoldersChange(selected);
    }, [selected, onSelectedFoldersChange]);

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
                    if (selectMultiple) {
                        if (selected.includes(id)) {
                            setSelected(selected.filter((i) => i != id));
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
