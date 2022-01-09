const { useEffect, useRef } = require('react');

const useEventListener = (event, handler, eventOptions = {}) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventHandler = (...args) => {
      handlerRef.current(...args);
    };
    window.addEventListener(event, eventHandler, eventOptions);

    return () => {
      window.removeEventListener(event, eventHandler);
    };
    // eslint-disable-next-line
  }, []);
};

export default useEventListener;
