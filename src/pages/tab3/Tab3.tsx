import { IonContent, IonHeader, IonItem, IonList, IonPage, IonRow, IonSelect, IonSelectOption } from '@ionic/react';
import { useContext, useState } from 'react';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import AppContext from '../../context/AppContext';
import useGetDocuments from '../../hooks/useGetDocuments';
import './Tab3.css';
import EvaluationCard from '../../components/EvaluationCard';

const Tab3: React.FC = () => {
  const [currentOption, setCurrentOption] = useState<"all" | "architect" | "design" | "others">('all');
  let driveID = process.env.REACT_APP_EVALUATION_DRIVE_ID;
  const {files, loading } = useGetDocuments(driveID);
  const {search, changeSearch} = useContext(AppContext);

  let evaluationCards = !loading && files?.sort((a, b) => { return a.name.localeCompare(b.name)}).map((file, index) => {
    if (file.name.toLowerCase().includes(search.toLowerCase())){ 
      switch (currentOption) {
        case 'architect':
          if (file.name.toLowerCase().includes('arquitectura')){
            return (
              <EvaluationCard key={file.id}
                name={file.name} 
                img={`/assets/test${index + 1}.jpg`} 
                id={file.id} />
            )
          }
        break;
        case 'design':
          if (file.name.toLowerCase().includes('industrial')){
            return (
              <EvaluationCard 
                name={file.name} 
                img={`/assets/test${files.length - index}.jpg`} 
                id={file.id} />
            )
          }
        break;
        case 'others':
          if (!file.name.toLowerCase().includes('arquitectura') && !file.name.toLowerCase().includes('industrial')){
            return (
              <EvaluationCard
                key={file.id}
                name={file.name}
                img={`/assets/test${index + 1}.jpg`}
                id={file.id} />
            )
          }
          break;
        default:
        return (
          <EvaluationCard 
            name={file.name} 
            img={`/assets/test${index + 1}.jpg`} 
            id={file.id} />
        )
      }
    }
  })

  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class='bg-img'> 
        <IonHeader collapse="condense">
          <IonRow className='filter-aligned evaluate__container__filter'>    
          <IonList className='filter-size filter-rounded_border'>
            <IonItem className='filter-item-size'>             
              <IonSelect className='ion-select-article' placeholder="Filtrar" interface='popover' onIonChange={function filter(op) {
                setCurrentOption(op.detail.value);
                changeSearch!("");
              }
                }>
              <IonSelectOption value="all" className='option-filter' >Todos</IonSelectOption>
              <IonSelectOption value="architect" className='option-filter' >Arquitectura</IonSelectOption>
              <IonSelectOption value="design" className='option-filter' >Dise&ntilde;o</IonSelectOption>
              <IonSelectOption value="others" className='option-filter' >Otros</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
          </IonRow>
        </IonHeader>
        <div>
        {
          <img className={loading ? "imageArticleLoading visible"
              : "imageArticleLoading hidden"}
              src="/assets/Spinner-1s-200px_transparent.svg"
              alt="loading image" 
              style={{"position":"fixed"}}/>
        }
        {
          !loading &&
          <div className='evaluation-grid'>{evaluationCards}</div>
          // !loading && files?.sort((a, b) => { return a.name.localeCompare(b.name)}).map((file, index) => {
          //   return <EvaluationCard 
          //   name={file.name} 
          //   img={`/assets/test${files.length - index}.jpg`} 
          //   id={file.id} />
          // })
        }
        </div>
        <div>
          <div className='under_construction-container'>
            {!loading && <p className='under_construction_text'><b>Proximamente abr&aacute; otras evaluaciones.</b></p>}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
