import { IonLoading } from '@ionic/react';
import React from 'react';
import useGetArticlesData from '../../hooks/useGetArticlesData';
import { File } from '../../models/File';
import TutorialCard from '../TutorialCard';

interface props {
  files: Array<File> | null | undefined;
}
const TutorialComponent : React.FC<props> = ({files}) => {
  const {articlesData, loading} = useGetArticlesData(files);
  const createTutorialCards = articlesData?.map((tutorial) => {
    return {
      message: `${tutorial[0]}`,
      character: `${tutorial[1]}`,
      align: `${tutorial[2]}`
    }
  })
  console.log(articlesData);
  console.log(createTutorialCards);
  return (
    <>
    { loading ?
        <IonLoading isOpen={loading} duration={5000} />
        : <TutorialCard slides={createTutorialCards?.reverse()!} />
    }
    </>
  )
}

export default TutorialComponent;