import * as React from 'react';
import { PacmanLoader } from 'react-spinners';

const Spinner = () => {

  return (
    <div className="spinner">
      <PacmanLoader  size={25} color={"#0078d4"} />
      <p className="spinner-text">Chargement...</p>
    </div>
  );
};

export default Spinner;
