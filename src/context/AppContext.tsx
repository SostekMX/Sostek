import React, { useState, useEffect, createContext, FC } from 'react';

interface IAppContext {
    dark: boolean;
    search: string;
    tutorial: boolean;
    changeSearch?: (currentSearch : string) => void;
    toggleDark?: () => void;
    toggleTutorial?: (value : boolean) => void;
}

const defaultState = {
    dark: false,
    search: "",
    tutorial: true,
}

const AppContext = createContext<IAppContext>(defaultState);
export default AppContext;

interface Children {
  children: any;
}

export const AppProvider: FC<Children> = ({children}) => {
    const [dark, setDark] = useState(defaultState.dark);
    const [search, setSearch] = useState(defaultState.search);
    const [tutorial, setTutorial] = useState(defaultState.tutorial);
    const toggleDark = () => {
      setDark(!dark);
    };
    const changeSearch = (currentSearch : string) => {
      setSearch(currentSearch);
    }
    const toggleTutorial = (value : boolean) => {
      setTutorial(value);
    };
  
    return (
      <AppContext.Provider
        value={{
          dark,
          search,
          tutorial,
          toggleDark,
          changeSearch,
          toggleTutorial
        }}
      >
        {children}
      </AppContext.Provider>
    );
  };