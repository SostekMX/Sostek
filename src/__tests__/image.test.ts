import { sized } from '../utils/image';

test('pide el ancho solo a los hosts que lo permiten', () => {
  expect(sized('https://res.cloudinary.com/x/image/upload/v1/a.jpg', 320)).toBe('https://res.cloudinary.com/x/image/upload/c_limit,w_320,f_auto,q_auto/v1/a.jpg');
  expect(sized('https://images.unsplash.com/p?auto=format&w=1974&q=80', 800)).toBe('https://images.unsplash.com/p?auto=format&w=800&q=80');
  expect(sized('https://cdn.pixabay.com/a_960_720.jpg', 800)).toBe('https://cdn.pixabay.com/a_960_720.jpg');
  expect(sized(undefined, 800)).toBeUndefined();
});
