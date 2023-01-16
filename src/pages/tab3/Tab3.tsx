import { IonContent, IonHeader, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useContext, useState } from 'react';
import AppBarPopOver from '../../components/AppBarPopOver';
import ExploreContainer from '../../components/ExploreContainer';
import QuestionTestCard from '../../components/QuestionTestCard';
import AppContext from '../../context/AppContext';
import useGetDocuments from '../../hooks/useGetDocuments';
import useGetEvaluationData from '../../hooks/useGetEvaluationData';
import './Tab3.css';
import EvaluationCard from '../../components/EvaluationCard';

const Tab3: React.FC = () => {
  let driveID = process.env.REACT_APP_EVALUATION_DRIVE_ID;
  const {files, loading } = useGetDocuments(driveID);
  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class='bg-img'> 
        <IonHeader collapse="condense">
        </IonHeader>
        <div>
        {
          loading && <IonLoading isOpen={loading} duration={3000}  />
        }
        {
          !loading && files?.map((file, index) => {
            return <EvaluationCard 
            name={file.name} 
            img={`/assets/test${files.length - index}.jpg`} 
            id={file.id} />
          })
        }
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
