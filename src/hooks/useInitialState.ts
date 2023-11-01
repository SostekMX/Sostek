import { useState } from "react";
import { File } from "../models/File";

const fileValue : any = new Array<File>();
const initialState = {
    files: fileValue,
}

const useInitialState = () => {
    const [state, setState] = useState(initialState);

    const addToFiles = (payload : File[] | null | undefined) => {
        setState({
            ...state,
            files: [payload]
        });
    };
    return {
        state,
        addToFiles,
    }
};

export default useInitialState;