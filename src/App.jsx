import { useCallback, useEffect, useState } from "react";
import Scene from "./components/Scene.jsx";
import Overlay from "./components/Overlay.jsx";
import FlowerMessage from "./components/FlowerMessage.jsx";
import Loader from "./components/Loader.jsx";

export default function App() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFlowerClick = useCallback((text, x, y) => {
    setMessage({ text, x, y, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(null), 4500);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <>
      <Scene onReady={() => setReady(true)} onFlowerClick={handleFlowerClick} />
      <Overlay />
      <FlowerMessage message={message} />
      <Loader visible={!ready} />
    </>
  );
}
