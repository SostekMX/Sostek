import { IonCol, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
//import ExploreContainer from '../components/ExploreContainer';
import DocumentCard from '../components/DocumentCard';
import './Tab1.css';
import { dummyArticles } from './DocumentsData';


//var count = Object.keys(dummyArticles).length;

const Tab1: React.FC= () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
         <IonCol >
        {dummyArticles.map((data,key) =>{
            return(
              
              <IonContent key={key}>
                <DocumentCard  name= {data.title} 
                description = {data.description} 
                img_url= {data.url_img}  
                id = {data.id}/>
              </IonContent>
              
              
            );
          })}
        </IonCol> 
        
        
        
    
      </IonContent>
        
        
    </IonPage>
  );
};

export default Tab1;
