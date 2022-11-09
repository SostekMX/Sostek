import { useState } from "react";
import useGetArticlesData from './useGetArticlesData';
import useGetDocuments from "./useGetDocuments";

let driveID = process.env.REACT_APP_DRIVE_ID;
const {files} = useGetDocuments(driveID);
const {articlesData} = useGetArticlesData(files);

const useLocalStorage = (key: string, defaultValue : any) => {
    const getInitialValue = () => localStorage.getItem(key) ?? defaultValue;
    const [value, setValue] = useState(getInitialValue);

    const setAndStoreValue = (newValue : any) => {
        setValue(newValue);
        localStorage.setItem(key, newValue);

    }
    return [value, setAndStoreValue];
}

const [allArticles, setAllArticles] = useLocalStorage("articles", articlesData)


export default useLocalStorage;