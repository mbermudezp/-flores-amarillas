import { useEffect, useState } from "react";

export default function FlowerMessage({ message }) {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setCurrent(message);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [message]);

  if (!current) return null;

  const x = Math.min(Math.max(current.x, 130), window.innerWidth - 130);
  const y = Math.max(current.y, 150);

  return (
    <div
      className={`flower-message${visible ? " show" : ""}`}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <span className="flower-message__icon">&#127803;</span>
      <p className="flower-message__text">{current.text}</p>
    </div>
  );
}
