import React, { useState, useEffect, createContext, FC } from 'react';

interface IAppContext {
    dark: boolean;
    search: string;
    tutorial: boolean;
    score: number;
    currentAnswersAndScores: Map<string, number>,
    changeSearch?: (currentSearch : string) => void;
    toggleDark?: () => void;
    toggleTutorial?: (value : boolean) => void;
    addScore?: (answer : string, value : number) => void;
}

const defaultState = {
    dark: false,
    search: "",
    tutorial: true,
    score: 0,
    currentAnswersAndScores: new Map()
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
    const [currentAnswersAndScores, setCurrentAnswersAndScores] = useState(defaultState.currentAnswersAndScores);
    const toggleDark = () => {
      setDark(!dark);
    };
    const changeSearch = (currentSearch : string) => {
      setSearch(currentSearch);
    }
    const toggleTutorial = (value : boolean) => {
      setTutorial(value);
    };
    const addScore = (answer : string, value : number) => {
      console.log(answer, value)
      console.log(currentAnswersAndScores.has(answer))
      if(currentAnswersAndScores.has(answer)) {
        setScore(score - currentAnswersAndScores.get(answer)!);
        currentAnswersAndScores.delete(answer);
      }
      else {
        setScore(score + value);
        currentAnswersAndScores.set(answer, value);
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
          addScore,
          currentAnswersAndScores

        }}
      >
        {children}
      </AppContext.Provider>
    );
  };