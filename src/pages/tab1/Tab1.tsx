import ExploreContainer from '../../components/ExploreContainer';
import ArticleCardModal from '../../components/ArticleCardModal';
import { IonCol, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
//import ExploreContainer from '../components/ExploreContainer';
import DocumentCard from '../../components/DocumentCard';
import './Tab1.css';
import { dummyArticles } from '../document/DocumentsData';
import ArticleCarrousel from '../../components/ArticleCarrousel';


const dummyArticle = {
  imageUrl : "/assets/article-img.jpeg",
  title : "Nombre del artículo",
  subtitle : "Subtitulo del articulo",
  author : "Fulanito de Tal",
  body : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
}

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen class='bg-img'> 
        <IonHeader collapse="condense">
      
        </IonHeader>
        <ArticleCardModal imageUrl={dummyArticle.imageUrl} title={dummyArticle.title} subtitle={dummyArticle.subtitle} author={dummyArticle.author} body={dummyArticle.body} ></ArticleCardModal>
        <ArticleCarrousel></ArticleCarrousel>
        
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
