import React, { forwardRef, useImperativeHandle } from 'react';
import { IonIcon, useIonRouter } from '@ionic/react';
import { TabBar } from 'glisse';
import { bookOutline, clipboardOutline, layersOutline, logInOutline, personCircleOutline } from 'ionicons/icons';
import { useI18n } from '../../i18n/LanguageContext';
import { isLoggedIn } from '../../utils/session';
import './GlassTabBar.css';

export type ActiveTab = 'tab1' | 'tab2' | 'tab3' | 'account' | null;

interface Props {
  slot: 'bottom';
  hidden: boolean;
  activeTab: ActiveTab;
}

/* Barra de navegacion del movil. IonTabs exige un hijo con isTabBar para aceptarla en lugar
   de IonTabBar, la coloca segun su `slot` y le pide por ref la pestana activa. */
const GlassTabBar = forwardRef<unknown, Props>(({ hidden, activeTab }, ref) => {
  const router = useIonRouter();
  const { t } = useI18n();
  useImperativeHandle(ref, () => ({ state: { activeTab }, selectTab: () => false }), [activeTab]);
  if (hidden) return null;

  const logged = isLoggedIn();
  const paths: Record<string, string> = { tab1: '/tab1', tab2: '/tab2', tab3: '/tab3', account: logged ? '/Profile' : '/' };
  const items = [
    { value: 'tab1', label: t('nav.learn'), icon: <IonIcon icon={bookOutline} aria-hidden='true' /> },
    { value: 'tab2', label: t('nav.play'), icon: <IonIcon icon={layersOutline} aria-hidden='true' /> },
    { value: 'tab3', label: t('nav.assess'), icon: <IonIcon icon={clipboardOutline} aria-hidden='true' /> },
    {
      value: 'account',
      label: logged ? t('nav.profile') : t('nav.loginShort'),
      icon: <IonIcon icon={logged ? personCircleOutline : logInOutline} aria-hidden='true' />,
    },
  ];

  return (
    <div className='tabbar'>
      <TabBar
        aria-label={t('nav.main')}
        items={items}
        value={activeTab}
        onValueChange={value => router.push(paths[value], 'none')}
      />
    </div>
  );
}) as React.ForwardRefExoticComponent<Props & React.RefAttributes<unknown>> & { isTabBar: boolean };

GlassTabBar.isTabBar = true;

export default GlassTabBar;
