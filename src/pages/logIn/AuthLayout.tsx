import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Glass } from 'glisse';
import './LogIn.css';

interface Props {
  headline: string;
  desc: string;
  extra?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}

/* Las cuatro pantallas de acceso: el follaje a sangre, el titular enorme y un panel de
   vidrio con el formulario. El tamano del titular depende de su linea mas larga, para que
   ocupe todo su espacio en cualquier idioma sin desbordarse. */
const AuthLayout: React.FC<Props> = ({ headline, desc, extra, wide, children }) => {
  const lines = headline.split('\n');
  const chars = Math.max(...lines.map(line => line.length));

  return (
    <IonPage>
      <IonContent fullscreen className='auth-content'>
        <div className='auth'>
          <span className='logo auth__logo' role='img' aria-label='SOSTEK' />

          <div className='auth__pitch'>
            <p className='auth__headline' style={{ '--chars': chars } as React.CSSProperties}>
              {lines.map((line, i) => (
                <span className='auth__line' key={i}>
                  <span style={{ '--i': i } as React.CSSProperties}>{line}</span>
                </span>
              ))}
            </p>
            <p className='auth__desc'>{desc}</p>
            {extra}
          </div>

          <Glass className={`auth__panel${wide ? ' auth__panel--wide' : ''}`}>
            <main>{children}</main>
          </Glass>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthLayout;
