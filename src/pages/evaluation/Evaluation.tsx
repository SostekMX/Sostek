import { IonContent, IonHeader, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useContext, useState } from 'react';
import { useParams } from 'react-router';
import AppBarPopOver from '../../components/AppBarPopOver';
import QuestionTestCard from '../../components/QuestionTestCard';
import AppContext from '../../context/AppContext';
import useGetEvaluationData from '../../hooks/useGetEvaluationData';
import './evaluation.css';

interface RouteParams{
    name: string,
    id: string
}
const Evaluation: React.FC = () => {
    const {name, id} = useParams<RouteParams>();
  const {evaluation, loading } = useGetEvaluationData(id);
  const { score } = useContext(AppContext);

  return (
    <IonPage>
      <AppBarPopOver></AppBarPopOver>
      <IonContent fullscreen class='bg-img'> 
        <IonHeader collapse="condense">
          <h1 className='header__title'>
            {
                name
            }
          </h1>
        </IonHeader>
        {
          <img className={loading ? "imageArticleLoading visible"
              : "imageArticleLoading hidden"}
              src="/assets/Spinner-1s-200px_transparent.svg"
              alt="loading image" 
              style={{"position":"fixed"}}/>
        }
          <div className={loading ? "hidden evaluation__questions" : "visible evaluation__questions"}>
          {
          !loading && evaluation?.at(0)?.values.map( (question, index) => {
            return <QuestionTestCard 
            question={question[1]} 
            comments={undefined} 
            options={evaluation![1].values[index]} 
            points={evaluation![2].values[index]}/>
          })
          }
          </div>
        
        {!loading && <h1 className='evaluation__footer__title' 
        style={{color:"white", textAlign:"center"}}>
        {
          `Resultado final: ${score}`
        }
        </h1>}
      </IonContent>
    </IonPage>
  );
};

export default Evaluation;
