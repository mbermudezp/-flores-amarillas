import { useEffect, useState } from "react";

export default function Overlay() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShown(true), 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="overlay">
      <div className={`message${shown ? " show" : ""}`}>
        <h1 className="message__title">Para Fely &#127803;</h1>
        <p className="message__text">Con cariño, tu buen vecino, el hombre araña &#128375;</p>
        <p className="message__sub">
          Que nunca te falten flores amarillas ni motivos para sonreír.
        </p>
      </div>
      <p className="hint">Toca una flor para leer un mensaje bonito &#128155;</p>
    </main>
  );
}
