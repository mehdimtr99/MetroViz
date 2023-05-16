import * as React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';

const SuccessMessage: React.FunctionComponent = () => (
  <div style={styles.container}>
    <MessageBar messageBarType={MessageBarType.success} style={styles.message}>
      Données chargées avec succès. Merci !
    </MessageBar>
  </div>
);

export default SuccessMessage;

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '30vh',
  },
  message: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: "green",
    margin: "auto",
  },
};

