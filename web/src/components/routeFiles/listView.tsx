import { getRequest } from "@src/apiRequest";
import { Folder } from "@src/types/Folder";
import { SubFolderGet } from "@src/types/SubFolderGet";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { useAuth } from "react-oidc-context";

interface ListViewFolderProps {
  name: string;
  children?: ReactNode;
  onClick?: () => void;
}

// TODO: make into node, fetch data on click in here recursively
const ListViewFolder: React.FC<ListViewFolderProps> = ({
  name,
  children,
  onClick,
}) => {
  return (
    <div>
      <button onClick={onClick}>{name}</button>
      <div className="pl-2">{children}</div>
    </div>
  );
};

interface NestedFolder {
  children: NestedFolder[];
  name: string;
  id: number;
}

const ListView = () => {
  const [folders, setFolders] = useState<NestedFolder | undefined>(undefined);

  const auth = useAuth();
  const { data: topLevelFolder } = useQuery({
    queryKey: [auth.user],
    queryFn: async (): Promise<number> => {
      // TODO: properly handle no token
      const token = auth.user?.id_token;
      if (token === undefined || auth.user?.expired) {
        throw "Failed to authenticate";
      }

      if (folders !== undefined) {
        throw "Already got folders";
      }

      const resp = await getRequest({
        path: "/user/top_level_folder",
        id_token: token,
      });

      const id = parseInt(await resp.text());
      setFolders({ children: [], name: "Your Files", id });
      return id;
    },
  });

  if (folders === undefined) {
    return <p>Loading</p>;
  } else {
    return (
      <ListViewFolder
        name={folders.name}
        onClick={async () => {
          // TODO: properly handle no token
          const token = auth.user?.id_token;
          if (token === undefined || auth.user?.expired) {
            return;
          }

          const params: SubFolderGet = { folderId: folders.id };

          const resp = await getRequest({
            path: "/user/sub_folders",
            id_token: token,
            queryParams: params,
          });

          const subFolders = (await resp.json()) as Folder[];
          setFolders({
            ...folders,
            children: subFolders.map((f) => ({
              id: f.id,
              name: f.name,
              children: [],
            })),
          });
        }}
      >
        {folders.children.map((f) => (
          <ListViewFolder name={f.name}></ListViewFolder>
        ))}
      </ListViewFolder>
    );
  }
};

export default ListView;
