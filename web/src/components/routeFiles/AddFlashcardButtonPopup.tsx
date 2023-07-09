import Button from "@components/Button";
import Popup from "@components/Popup";
import { postRequest } from "@src/apiRequest";
import { FlashcardInsert } from "@src/types/FlashcardInsert";
import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { IoIosColorPalette } from "react-icons/io";

const CheckboxItem = ({ label = "" }) => {
    return (
        <div className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox" />
            <label className="text-gray-700">{label}</label>
        </div>
    );
};

interface AddFlashcardButtonPopupProps {
    currentFolderId: number | undefined;
}

const AddFlashcardButtonPopup: React.FC<AddFlashcardButtonPopupProps> = ({
    currentFolderId,
}) => {
    // Popup state
    // TODO: Make into form?
    const [showPopup, setShowPopup] = useState(false);
    const [term, setTerm] = useState("");
    const [definition, setDefinition] = useState("");

    const auth = useAuth();

    const methods: string[] = ["Flip", "Match", "Learn"];

    // TODO: instead of useEffect, do something like https://stackoverflow.com/questions/71124909/react-useeffect-dependencies-invalidation
    const handleAddFlashcard = async () => {
        // TODO: properly handle no token
        const token = auth.user?.id_token;
        if (token === undefined || auth.user?.expired) {
            return;
        }

        // Not yet loaded top level folder - TODO: error?
        if (currentFolderId === undefined) {
            return;
        }

        // Create payload with required data
        const payload: FlashcardInsert = {
            term,
            definition,
            folderId: currentFolderId,
        };

        // POST the payload
        // TODO: properly handle error
        await postRequest({
            path: "/flashcard/add",
            id_token: token,
            payload: JSON.stringify(payload),
        });
    };

    //TODO don't allow creation of card if term or definition empty
    return (
        <>
            <Popup show={showPopup} onCancel={() => setShowPopup(false)}>
                {/* TODO: Form */}
                <div className="space-y-2">
                    <h1 className="text-2xl">Create Flashcard</h1>
                    <div>
                        <p className="text-lg">Term</p>
                        <textarea
                            className="px-2 pt-1 pb-2 light-border rounded-lg w-full"
                            onChange={(e) => setTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <p className="text-lg">Definition</p>
                        <textarea
                            className="px-2 pt-1 pb-20 light-border rounded-lg w-full"
                            onChange={(e) => setDefinition(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        <div>
                            <h1 className="text-lg">Review Methods</h1>
                            {methods.map((method, index) => (
                                <CheckboxItem key={index} label={method} />
                            ))}
                        </div>
                        <div className="flex flex-col items-center">
                            <h1 className="text-center text-lg">Colour</h1>
                            <div>
                                <button>
                                    <IoIosColorPalette
                                        size={50}
                                        strokeWidth={1}
                                    />
                                </button>
                            </div>
                        </div>
                        <div>
                            <h1 className="flex justify-center text-lg">
                                Similar Cards
                            </h1>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            handleAddFlashcard();
                            setShowPopup(false);
                        }}
                        className="flex justify-center"
                    >
                        + Create
                    </Button>
                </div>
            </Popup>
            <Button onClick={() => setShowPopup(true)}>
                Create flashcard!
            </Button>
        </>
    );
};

export default AddFlashcardButtonPopup;
