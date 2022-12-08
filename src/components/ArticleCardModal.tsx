import {IonHeader, IonToolbar, IonContent, IonButton, IonModal, IonButtons, IonIcon} from "@ionic/react";
import { close } from "ionicons/icons";
import { useRef, useState } from "react";


interface Props {
    imageUrl: string, 
    title: string, 
    subtitle: string, 
    author: string,
    body: string
}

const ArticleCardModal: React.FC<Props> = (props) => {
    const modal = useRef<HTMLIonModalElement>(null);
    const [presentingElement, setPresentingElement] = useState<HTMLElement | null>(null);
    const [isOpen, setIsOpen] = useState(true);

    return (
            <IonModal ref={modal} isOpen={isOpen} presentingElement={presentingElement!} canDismiss={true}>
                <IonContent class="ion-padding bg-img">  
                    <IonHeader>
                        <IonToolbar class='transparent'>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setIsOpen(!isOpen)}>
                                    <IonIcon icon={close}></IonIcon>
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                        <img src={props.imageUrl}></img>
                        <h2>{props.title}</h2>
                        <h4>{props.subtitle}</h4>
                        <h6>Por: {props.author}</h6>
                        
                        <p>
                            {props.body}
                        </p>
                </IonContent>
            </IonModal>
    );
}

export default ArticleCardModal;