import React from 'react';
import { IonLoading } from '@ionic/react';
import ArticleCardModal from './ArticleCardModal';
import { File } from '../models/File';
import useGetArticlesData from '../hooks/useGetArticlesData';
interface props {
  files: Array<File> | null | undefined;
}

const ArticleCardModalWrapper: React.FC<props> = ({files}) => {
  const {articlesData, loading} = useGetArticlesData(files);

  return (
    <div>
      <IonLoading isOpen={loading} duration={5000}/>
    {
        !loading && articlesData?.map((article : any) => {
          return (
            <ArticleCardModal 
              title={article[0]} 
              subtitle={article[1]}
              body={article[3]}
              imageUrl={article[4]} 
              author={article[5]}
        />
          )
        })
    }
    </div>
  )
}

export default ArticleCardModalWrapper;