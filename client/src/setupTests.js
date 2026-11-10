import '@testing-library/jest-dom';

// Components read the backend URL from the env at render time; never hit a real server in tests.
process.env.REACT_APP_HOST_NAME = 'http://api.test';

// ScrollToTop calls this on every route change; jsdom only logs "not implemented".
window.scrollTo = () => { };

// jsdom has no matchMedia, which react-responsive needs.
if (!window.matchMedia) {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    });
}
