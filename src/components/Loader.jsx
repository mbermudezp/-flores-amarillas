export default function Loader({ visible }) {
  return (
    <div className={`loader${visible ? "" : " hidden"}`}>
      <span className="loader__flower">&#127803;</span>
      <span className="loader__text">Cultivando flores...</span>
    </div>
  );
}
