import React, { useState, createContext, FC } from 'react';
import { applyAnswer } from '../utils/scoring';

interface IAppContext {
    search: string;
    tutorial: boolean;
    score: number;
    currentAnswersAndScores: Map<string, {category: string, value: number}>,
    transparentToolbar: boolean,
    changeSearch?: (currentSearch : string) => void;
    toggleTutorial?: (value : boolean) => void;
    addScore?: (category: string, answer : string, value : number) => void;
    toggleTransparent?: (value : boolean) => void;
}

const defaultState = {
    search: "",
    tutorial: false,
    score: 0,
    currentAnswersAndScores: new Map(),
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
    const [score, setScore] = useState(defaultState.score);
    const [currentAnswersAndScores, setCurrentAnswersAndScores] = useState(defaultState.currentAnswersAndScores);
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
    const addScore = (category: string, answer: string, value: number) => {
      const result = applyAnswer(currentAnswersAndScores, score, category, answer, value);
      setScore(result.score);
      setCurrentAnswersAndScores(result.map);
    }

  
    return (
      <AppContext.Provider
        value={{
          search,
          tutorial,
          changeSearch,
          toggleTutorial,
          score,
          addScore,
          currentAnswersAndScores,
          transparentToolbar,
          toggleTransparent
        }}
      >
        {children}
      </AppContext.Provider>
    );
  };