const { useEffect, useRef } = require('react');

const useEventListener = (event, handler, eventOptions = {}) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventHandler = () => {
      handlerRef.current();
    };
    window.addEventListener(event, eventHandler, eventOptions);

    return () => {
      window.removeEventListener(event, eventHandler);
    };
    // eslint-disable-next-line
  }, []);
};

export default useEventListener;
