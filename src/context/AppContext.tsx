import { useState, createContext, FC } from 'react';

interface IAppContext {
    search: string;
    changeSearch?: (currentSearch : string) => void;
}

const defaultState = {
    search: "",
}

const AppContext = createContext<IAppContext>(defaultState);
export default AppContext;

interface Children {
  children: any;
}

export const AppProvider: FC<Children> = ({children}) => {
    const [search, setSearch] = useState(defaultState.search);

    const changeSearch = (currentSearch : string) => {
      sessionStorage.setItem("search", currentSearch);
      setSearch(currentSearch);
    }

    return (
      <AppContext.Provider value={{ search, changeSearch }}>
        {children}
      </AppContext.Provider>
    );
  };
