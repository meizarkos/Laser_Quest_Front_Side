import "./LaserCell.css"
import { Laser } from "./Management";


function LaserCell(props : Laser) {
  return (
    <div className="laser-cell">
      <h3>{props.name}</h3>
      <p>Status: {props.status}</p>
      {props.status === 'loading' && <div className="loader"></div>}
      {props.status === 'active' && <span className="status-icon success"></span>}
      {props.status === 'fail' && <span className="status-icon fail"></span>}
    </div>
  );
}

export default LaserCell;