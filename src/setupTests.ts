// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// Mock matchmedia
window.matchMedia = window.matchMedia || function() {
  return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
  };
};

/* jsdom no trae ResizeObserver y los controles de Glisse lo usan al montar. */
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
