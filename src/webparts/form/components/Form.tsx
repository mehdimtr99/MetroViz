import * as React from 'react';
import { IFormProps } from './IFormProps';
import { IFormStates } from './IFormStates';
import { Stack, TextField, Text } from 'office-ui-fabric-react';
import { ICharacteristic } from './ICharacteristic';
import { IMachine } from './IMachine';
import { IControl } from './IControl';
import { sp } from '@pnp/sp/presets/all';
import ThankYouMessage from './ThankYouMessage';
import Spinner from './Spinner';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import styles from './Form.module.scss';
import { ISummary } from './ISummary';
// Set SharePoint site URL
sp.setup({
  sp: {
    baseUrl: "https://sy6mr.sharepoint.com"
  }
});

export default class Form extends React.Component<IFormProps, IFormStates> {

  constructor(props: {}) {
    super(props);
    sp.setup({
      spfxContext: this.context
    })
    this.state = {
      num: '',
      showAdditionalFields: false,
      characteristics: [],
      values: [],
      colors: [],
      isSubmitting: false,
      isSubmissionSuccessful: false,
      machine: { marking: 'a', type: '', family: '', manifacturer: '', SN: '' },
      control: { id: 0, employee: '', marking: '', date: '', conformity: true },
      summary: { Id: 0, marking: '', characteristic: '', value: 0, limInf: 0, limSup: 0, conformity: true, type: '', manifacturer: '', family: '', date: '', employee: '' },
      newId: 0,
      showDialog: false,
      summaries : []
    };
  }
  private Submit = () => {
    event.preventDefault();
    // Set showDialog state to true to show the confirmation dialog
    console.log("click...........");
    this.setState({ showDialog: true });
  }

  private handleConfirm = async (): Promise<void> => {
    this.handleAdditionalFieldsSubmit();
    console.log('Form submitted successfully');
    this.setState({ showDialog: false });
  }

  private handleCancel = () => {
    // Handle cancel button click or dialog overlay click
    console.log('Form submission cancelled');
    this.setState({ showDialog: false });
  }

  private handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const characteristics: ICharacteristic[] = await sp.web.lists.getByTitle('Characteristic').items.select('id', 'value', 'limSup', 'linInf', 'marking').filter(`marking eq '${this.state.num}'`).get(); 
    try {
      const machine: IMachine[] = await sp.web.lists.getByTitle("Machine").items.filter(`marking eq '${this.state.num}'`).get();
      const summary: ISummary[] = await sp.web.lists.getByTitle("Summary").items.filter(`marking eq '${this.state.num}'`).get();
      console.log(summary);
      this.setState({ showAdditionalFields: true, characteristics,machine: machine[0],summaries:summary })
    } catch (error) {
      console.log(`Erreur lors de cnx a la liste Machine : `, error);
    }
    try {
      ;
    } catch (error) {
      console.log("Une erreur s'est produite lors de la récupération des éléments de la liste : ", error);
    }
  };

  private handleAdditionalFieldsSubmit = async (): Promise<void> => {
    event.preventDefault();
    if (1) {
      this.setState({ showAdditionalFields: false, isSubmitting: true, isSubmissionSuccessful: false });
      const { characteristics } = this.state; // Utilisation de la déstructuration pour obtenir la liste des caractéristiques
      try {
        const list = sp.web.lists.getByTitle("Characteristic");
        for (const characteristic of characteristics) { // Utilisation d'une boucle for pour itérer sur les caractéristiques
          const item = list.items.getById(Number(characteristic.ID));
          await item.update({
            value: characteristic.val
          });
          // Appel de la fonction execute() sur la liste pour appliquer les modifications
        }
        console.log("Champ mis à jour avec succès !");
      } catch (error) {
        console.log("Erreur lors de la mise à jour du champ : ", error);
      }
      try {
        const list = sp.web.lists.getByTitle("Control");
        const control: IControl[] = await list.items.filter(`marking eq '${this.state.num}'`).get();
        this.setState({ control: control[0] });
        const controlItems = await list.items.select("id_ctl").orderBy("id_ctl", false).top(1).get();
        const lastId = controlItems.length > 0 ? controlItems[0].id_ctl : 0;
        // Ajouter 1 pour obtenir le nouvel ID
        const newId = lastId + 1;
        const employee = await sp.web.currentUser.get();
        const newItem = {
          Title: "",
          date: new Date().toISOString(),
          employee: employee.Title,
          marking: characteristics[0].marking,
          id_ctl: newId
        };

        await list.items.add(newItem).then(() => {
          console.log(`Nouvel élément ajouté avec succès avec l'ID de contrôle : ${newId} !`);
        }).catch((error) => {
          console.log(`Erreur lors de l'ajout du nouvel élément dans control `, error);
        });
      } catch (error) {
        console.log(`Erreur lors de l'ajout du nouvel élément : dans control`, error);
      }

      try {
        const machine: IMachine[] = await sp.web.lists.getByTitle("Machine").items.filter(`marking eq '${this.state.num}'`).get();
        this.setState({ machine: machine[0] });
      } catch (error) {
        console.log(`Erreur lors de cnx a la liste Machine : `, error);
      }
      //Remplire la liste Summarry
      try {
        var d = 0;
        const listSummary = sp.web.lists.getByTitle("Summary");
        const SummaryItems = await listSummary.items.select("ids").orderBy("ids", false).top(1).get();

        const lID = SummaryItems.length > 0 ? SummaryItems[0].ids : 0;

        // Ajouter 1 pour obtenir le nouvel ID
        const NID = lID + 1;
        console.log("newID" + NID);
        for (const characteristic of characteristics) { // Utilisation d'une boucle for pour itérer sur les caractéristiques

          var UID = d + NID;
          const newItemSummary = {
            Title: "title",
            marking: this.state.machine.marking,
            characteristic: String(d),
            value: characteristic.val,
            limInf: characteristic.linInf,
            limSup: characteristic.limSup,
            conformity: characteristic.conformity,
            type: this.state.machine.type,
            manifacturer: this.state.machine.manifacturer,
            family: this.state.machine.family,
            date: new Date().toISOString(),
            employee: (await sp.web.currentUser.get()).Title,
            ids: UID,
          };
          try {
            await listSummary.items.add(newItemSummary).then(() => {
              console.log('Nouvel élément ajouté avec succès dans Summary');
              this.setState({ isSubmitting: false, isSubmissionSuccessful: true });
            }).catch((error) => {
              console.log(`Erreur lors de l'ajout du nouvel élément : `, error);
              this.setState({ isSubmitting: false, isSubmissionSuccessful: false });
            });
          } catch (error) {
            console.log(`Erreur lors de l'ajout du nouvel élément : `, error);
            this.setState({ isSubmitting: false, isSubmissionSuccessful: false });
          }
          d++;
        }
      } catch (error) {
        console.log(`Erreur lors de cnx a la liste Summary : `, error);
      }
    }
  };

  private handleNameChange = (event: React.FormEvent<HTMLInputElement>, newValue?: string): void => {
    this.setState({ num: newValue ?? '' });
  };

  private handleNameChange2 = async (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, characteristic: ICharacteristic, index: number): Promise<void> => {
    const characteristics = [...this.state.characteristics];
    const target = event.target as HTMLInputElement;
    const v = target.value;
    let colors = [...this.state.colors]; // Copiez l'état actuel des couleurs
    if (v != null && v != '') {
      characteristics[index].val = Number(v);
      if (characteristic.linInf && Number(v) < characteristic.linInf) {
        colors[index] = 'red'; // Mettez à jour la couleur dans l'état colors
      } else if (characteristic.limSup && Number(v) > characteristic.limSup) {
        colors[index] = 'red'; // Mettez à jour la couleur dans l'état colors
      } else {
        colors[index] = 'green'; // Mettez à jour la couleur dans l'état colors
      }
    } else {
      colors[index] = 'black';
    }
    console.log("change...........");
    const graphVals = [];
    for (const summary of this.state.summaries) {
      if (Number(summary.characteristic) === index) {
        graphVals.push(summary.value);
      }
    }
    console.log(graphVals);
    
   
    
    this.setState({ characteristics, colors }); // Mettez à jour l'état characteristics et colors
  };


  public render(): React.ReactElement<IFormProps> {
    const { isSubmitting, isSubmissionSuccessful } = this.state;
    if (isSubmissionSuccessful) {
      return <ThankYouMessage />;
    }
    return (
      <div>
        {isSubmitting && !isSubmissionSuccessful ? (
          // Afficher un spinner de chargement pendant la soumission du formulaire
          <Spinner />
        ) : (
          this.state.showAdditionalFields == false && !isSubmissionSuccessful && !isSubmitting && (
            <form onSubmit={this.handleSubmit}>
              <div className={styles["container"]} >
                <div className={styles["container-close"]} >&times;</div>
                <img
                  src={require('../assets/Metro.png')}
                  alt="image" />
                <div className={styles["container-text"]}  >
                  <h2> Welcome to  <br /><span style={{ color: "rgba(186,71,64,1) !important", fontSize: "22px !important" }}>MetroViz</span></h2>
                  <p>the data visualization platform for the Metrology Department. <br /><br />  *Please enter the required data. <br /></p>
                  <TextField className={styles['textField']} onChange={this.handleNameChange} type="number" value={this.state.num} placeholder='Numero de Machine' required />
                  <button type='submit'>Recherche</button>
                  <span>© Ceratizit</span>
                </div>
              </div>
            </form>)
        )}

        {this.state.showAdditionalFields && (
          <div className={styles["container1"]}>
            <div className={styles["container11"]}>
              <ul>
                <li><span className={styles["list-title"]}>Numéro de machine :</span>{this.state.machine.marking}</li>
                <li><span className={styles["list-title"]}>Fabricant :</span>{this.state.machine.manifacturer}</li>
                <li><span className={styles["list-title"]}>Famille :</span>{this.state.machine.family}</li>
                <li><span className={styles["list-title"]}>Type :</span>{this.state.machine.type}</li>
              </ul>
            </div>
            <div className={styles["container12"]}>
              <form className={styles["form2"]}>
              <p><br />  *Please enter the required data. <br /></p>
                {this.state.characteristics.map((characteristic, index) => (
                  <div className={styles["container121"]}>
                    <div className={styles["container121-text"]}>hhhhhhhhhhhhh</div>
                    <Stack key={characteristic.ID} verticalAlign="center" tokens={{ childrenGap: 10 }}>
                      <div className={styles["container121-text"]}>
                        <TextField
                          key={characteristic.ID}
                          placeholder={"valeur : " + (index + 1)+ "..."}
                          value={characteristic.val ? String(characteristic.val) : ""}
                          id={`val-${characteristic.ID}`}
                          required
                          onChange={(event) => this.handleNameChange2(event, characteristic, index)}
                          className='textField'
                          type="number"
                          styles={{
                            field: { color: this.state.colors[index] }
                          }}
                        />
                        {this.state.colors[index] === 'red' && (
                          <Text variant="small" style={{ color: 'red', textAlignLast: 'right' }} className='text-right'>
                            Value out of range
                          </Text>
                        )}
                        {this.state.colors[index] === 'green' && (
                          <Text variant="small" style={{ color: 'green', textAlign: 'right' }} className='text-right'>
                            Valid value
                          </Text>
                        )}
                      </div>
                    </Stack>
                  </div>
                ))}
                <button onClick={this.Submit}>Envoyer</button>
                  <Dialog
                    hidden={!this.state.showDialog}
                    dialogContentProps={{
                      type: DialogType.normal,
                      title: 'Confirmation',
                      closeButtonAriaLabel: 'Close',
                      subText: 'Are you sure you want to submit the form?'
                    }}
                    modalProps={{
                      isBlocking: true,
                      styles: { main: { maxWidth: 450 } }
                    }}
                  >
                    <DialogFooter>
                      <button onClick={this.handleConfirm}>Yes</button>
                      <button onClick={this.handleCancel}>No</button>
                    </DialogFooter>
                  </Dialog>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
}
