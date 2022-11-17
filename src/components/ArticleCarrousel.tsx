import React, { useState } from 'react';
import { IonCol, IonItem,  IonList, IonLoading, IonRow, IonSelect, IonSelectOption} from '@ionic/react';
import DocumentCard from './DocumentCard';
import { File } from '../models/File';
import './ArticleCarrousel.css'
import useGetArticlesData from '../hooks/useGetArticlesData';
import useGetFirstImageOfPresentations from '../hooks/useGetFirstImageOfPresentations';

interface props {
    files: Array<File> | null | undefined;
    presentations: Array<File>| null | undefined;
  }

const ArticleCarrousel: React.FC<props> = ({files, presentations}) => {
  const [currentOption, setCurrentOption] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const {articlesData, loading} = useGetArticlesData(files);
    let presentationsAsStringArrayById = presentations?.map((url) => {
         return url.id;
    });
    let presentationsAsStringArrayTitle = presentations?.map((url) => {
        return url.name;
   });
    const { urlImages } = useGetFirstImageOfPresentations(presentationsAsStringArrayById);
    console.log(urlImages);
    console.log(articlesData);


    let articleCards = !loading && articlesData!.map((article : any) => {
        if ((article[6].toLowerCase().includes(currentSearch.toLowerCase()) || article[0].toLowerCase().includes(currentSearch.toLowerCase()))) {
            return(
                <div key={article[8]}>
                {
                    article.length !== 0 && <DocumentCard 
                    name={article[0]} 
                    description={article[3]} 
                    img_url={article[4]} 
                    id={article[8]}
                    type={article[2]}
                    />
                }
                </div>
            );
        }
    });

    let presentationCards = !loading && presentationsAsStringArrayById!.map((presentation : any, index) => {
        if ((presentationsAsStringArrayTitle![index].toLowerCase().includes(currentSearch.toLowerCase()))) {
            return(
                <div key={presentation}>
                {
                    presentation.length !== 0 && <DocumentCard 
                    name={presentationsAsStringArrayTitle![index]} 
                    description={""} 
                    img_url={`https://drive.google.com/uc?id=${presentation}`} 
                    id={presentation}
                    type={"presentation"}
                    />
                }
                </div>
            );
        }
    });

    return(
            <IonCol>
                <IonRow className='filter-aligned'>
                   
                    <IonList className='filter-size filter-rounded_border'>
                        <IonItem className='filter-item-size'>
                            <IonSelect placeholder="Filtrar   " interface='popover' onIonChange={(op) => setCurrentOption(op.detail.value)}>
                            <IonSelectOption value="article" className='option-filter' >Presentaciones</IonSelectOption>
                            <IonSelectOption value="presentation" className='option-filter' >Artículos</IonSelectOption>
                            <IonSelectOption value="" className='option-filter' >Ambos</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                    </IonList>
                </IonRow>
                <div className="ion-content-scroll-host">
                    {
                        loading && <IonLoading isOpen={loading} duration={5000} />
                    }
                    {
                        !loading && currentOption === "" ? <div>
                            {articleCards}
                            {presentationCards}
                             </div> : currentOption === "article" ? <div> 
                             {articleCards}
                             </div> : <div>
                             {presentationCards} 
                                </div>
                    }
                    {/*
                    {
                        !loading && articlesData!.map((article : any, key) =>{
                        if((currentOption === "ambos" || currentOption === "") && (article[6].toLowerCase().includes(currentSearch.toLowerCase()) || article[0].toLowerCase().includes(currentSearch.toLowerCase()))){
                            return(
                                <div key={article[8]}>
                                {
                                    article.length !== 0 && <DocumentCard 
                                    name={article[0]} 
                                    description={article[3]} 
                                    img_url={article[4]} 
                                    id={article[8]}
                                    />
                                }
                                </div>
                            );
                        }
                        else {
                            if(article[3] === currentOption && (article[6].toLowerCase().includes(currentSearch.toLowerCase()) || article[0].toLowerCase().includes(currentSearch.toLowerCase()))){
                                return(
                                    <div key={article[8]}>
                                    {
                                        article.length !== 0 && <DocumentCard 
                                        name={article[0]} 
                                        description={article[3]} 
                                        img_url={article[4]} 
                                        id={article[8]}
                                        />
                                    }
                                    </div>
                                );
                            }
                        }
                })
                    }
                    */}
                    </div>
            </IonCol>
    );
};

export default ArticleCarrousel;