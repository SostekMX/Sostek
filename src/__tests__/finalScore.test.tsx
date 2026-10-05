import { render } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import FinalScoreEvaluation from '../pages/finalScoreEvaluation/FinalScoreEvaluation';
import { saveScore } from '../api/user';

jest.mock('../api/user', () => ({ saveScore: jest.fn() }));
jest.mock('../components/layout/AppBarPopOver', () => () => null);

const renderScore = () => render(
  <MemoryRouter initialEntries={['/score/Arquitectura Nivel 1']}>
    <Route path='/score/:name'><FinalScoreEvaluation /></Route>
  </MemoryRouter>
);

/* score_test se sobrescribe en el backend: cada guardado de mas pisa el resultado real. */
describe('guardado del puntaje en /score', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // CRA corre con resetMocks: la implementacion se fija en cada test.
    (saveScore as jest.Mock).mockResolvedValue({ success: true });
    sessionStorage.setItem('token', 'jwt');
  });

  it('guarda una sola vez por envio, aunque la pagina se vuelva a abrir', () => {
    sessionStorage.setItem('finalScore', '40');
    sessionStorage.setItem('maxScore', '96');
    sessionStorage.setItem('scorePending', '1');

    renderScore().unmount();
    renderScore();

    expect(saveScore).toHaveBeenCalledTimes(1);
    expect(saveScore).toHaveBeenCalledWith(40);
  });

  /* Regresion: tras el CTA, que limpia la sesion, "atras" guardaba un 0. */
  it('sin resultado en la sesion no guarda nada y lo dice', () => {
    const { getByText } = renderScore();
    expect(saveScore).not.toHaveBeenCalled();
    expect(getByText('No hay un resultado que mostrar')).toBeTruthy();
  });
});
