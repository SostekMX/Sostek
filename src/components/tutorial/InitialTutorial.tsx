import { IonLoading } from '@ionic/react';
import React from 'react';
import useGetDocuments from '../../hooks/useGetDocuments';
import TutorialComponent from './TutorialComponent';

const InitialTutorial : React.FC = () => {
    let tutorialDriveID = process.env.REACT_APP_TUTORIAL_DRIVE_ID;
    const {files, lastFile, loading } = useGetDocuments(tutorialDriveID);
  return (
    <>
        { loading ? <IonLoading isOpen={loading} duration={5000}/>
            : <TutorialComponent files={files} />
        }
    </>
  )
};

export default InitialTutorial;