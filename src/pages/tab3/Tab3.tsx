import { IonContent, IonHeader, IonItem, IonList, IonPage, IonRow, IonSelect, IonSelectOption } from '@ionic/react';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AppBarPopOver from '../../components/layout/AppBarPopOver';
import AppContext from '../../context/AppContext';
import './Tab3.css';
import EvaluationCard from '../../components/EvaluationCard';

interface EvaluationItem {
  _id: string;
  name: string;
  career: string;
}

const Tab3: React.FC = () => {
  const [currentOption, setCurrentOption] = useState<"all" | "architect" | "design" | "others">('all');
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { search, changeSearch } = useContext(AppContext);

  useEffect(() => {
    axios.get('http://localhost:8080/evaluations')
      .then(res => {
        if (res.data.success) setEvaluations(res.data.evaluations);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...evaluations].sort((a, b) => a.name.localeCompare(b.name));

  let evaluationCards = sorted
    .filter(ev => ev.name.toLowerCase().includes(search.toLowerCase()))
    .filter(ev => {
      if (currentOption === 'architect') return ev.career === 'Arquitectura';
      if (currentOption === 'design') return ev.career === 'Diseño Industrial';
      if (currentOption === 'others') return ev.career !== 'Arquitectura' && ev.career !== 'Diseño Industrial';
      return true;
    })
    .map((ev, index) => (
      <EvaluationCard key={ev._id} name={ev.name} img={`/assets/test${index + 1}.jpg`} id={ev._id} />
    ));

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
