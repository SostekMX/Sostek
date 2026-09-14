import React, { useState, createContext, FC } from 'react';

interface IAppContext {
    search: string;
    tutorial: boolean;
    transparentToolbar: boolean,
    changeSearch?: (currentSearch : string) => void;
    toggleTutorial?: (value : boolean) => void;
    toggleTransparent?: (value : boolean) => void;
}

const defaultState = {
    search: "",
    tutorial: false,
    transparentToolbar: false,
}

const AppContext = createContext<IAppContext>(defaultState);
export default AppContext;

interface Children {
  children: any;
}

export const AppProvider: FC<Children> = ({children}) => {
    const [search, setSearch] = useState(defaultState.search);
    const [tutorial, setTutorial] = useState(defaultState.tutorial);
    const [transparentToolbar, setTransparentToolbar] = useState(defaultState.transparentToolbar);

    const toggleTransparent = (value : boolean) => {
      setTransparentToolbar(value);
    };

    const changeSearch = (currentSearch : string) => {
      sessionStorage.setItem("search", currentSearch);
      setSearch(currentSearch);
    }

    const toggleTutorial = (value : boolean) => {
      setTutorial(value);
    };

    return (
      <AppContext.Provider
        value={{
          search,
          tutorial,
          changeSearch,
          toggleTutorial,
          transparentToolbar,
          toggleTransparent
        }}
      >
        {children}
      </AppContext.Provider>
    );
  };
