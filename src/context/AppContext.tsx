import React, { useState, useEffect, createContext, FC } from 'react';

interface IAppContext {
    dark: boolean;
    search: string;
    tutorial: boolean;
    score: number;
    changeSearch?: (currentSearch : string) => void;
    toggleDark?: () => void;
    toggleTutorial?: (value : boolean) => void;
    addScore?: (value : number, notSum : boolean) => boolean;
}

const defaultState = {
    dark: false,
    search: "",
    tutorial: true,
    score: 0
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
    const [score, setScore] = useState(defaultState.score);
    const toggleDark = () => {
      setDark(!dark);
    };
    const changeSearch = (currentSearch : string) => {
      setSearch(currentSearch);
    }
    const toggleTutorial = (value : boolean) => {
      setTutorial(value);
    };
    const addScore = (value : number, notSum : boolean) => {
      console.log(notSum);
      if (notSum) {
        setScore(score - value);
        return true;
      }
      else {
        setScore(score + value);
        return false;
      }
    }

  
    return (
      <AppContext.Provider
        value={{
          dark,
          search,
          tutorial,
          toggleDark,
          changeSearch,
          toggleTutorial,
          score,
          addScore

        }}
      >
        {children}
      </AppContext.Provider>
    );
  };