import * as React from 'react';
import { IFormProps } from './IFormProps';
import { IFormStates } from './IFormStates';
import { Stack, TextField, Text, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { ICharacteristic } from './ICharacteristic';
import { IMachine } from './IMachine';
import { IControl } from './IControl';
import { sp } from '@pnp/sp/presets/all';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import styles from './Form.module.scss';
import { ISummary } from './ISummary';
import { ChartControl } from '@pnp/spfx-controls-react/lib/ChartControl';
import { IData } from './IData';
import SuccessMessage from './ThankYouMessage';


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
      machine: { marking: 'a', machinetype: '', family: '', manifacturer: '', SN: '' },
      control: { id_ctl: 0, employee: '', marking: '', date: '', conformity: true },
      summary: { Id: 0, marking: '', characteristic: '', value: 0, limInf: 0, limSup: 0, conformity: true, machinetype: '', manifacturer: '', family: '', date: '', employee: '' },
      newId: 0,
      showDialog: false,
      summaries: [],
      datas: [],
      datas2: [],
      point: { val: 0, date: '' },
      len: [],
      machineExistpas : false
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


 /* private getCurrentUserEmail = async () => {
    try {
      const currentUser = await sp.web.currentUser();
      console.log(currentUser)
      return currentUser.Email;
    } catch (error) {
      console.log("Error getting current user email:", error);
      return null;
    }
  };*/
  private sendEmail = async () => {
   
      const toEmail = "mehdi.mathor@ceratizit.com";
      const subject = "Contrôle de la machine non conforme";
      const body = `<html>
      <head>
        <style>
          table, td, div, h1, p {
            font-family: Arial, sans-serif;
          }
          @media screen and (max-width: 530px) {
            .unsub {
              display: block;
              padding: 8px;
              margin-top: 14px;
              border-radius: 6px;
              background-color: #555555;
              text-decoration: none !important;
              font-weight: bold;
            }
            .col-lge {
              max-width: 100% !important;
            }
          }
          @media screen and (min-width: 531px) {
            .col-sml {
              max-width: 27% !important;
            }
            .col-lge {
              max-width: 73% !important;
            }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;">
        <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;">
          <table role="presentation" style="width:100%;border:none;border-spacing:0;">
            <tr>
              <td align="center" style="padding:0;">
               
                <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">
                  
                  <tr>
                    <td style="padding:30px;background-color:#ffffff;">
                      <h1 style="margin-top:0;margin-bottom:16px;font-size:26px;line-height:32px;font-weight:bold;letter-spacing:-0.02em;">Contrôle de la machine non conforme</h1>
                      <p style="margin:0;">Le contrôle de la machine <strong>${this.state.machine.marking}</strong> du fabricant <strong>${this.state.machine.manifacturer}</strong>, de type <strong>${this.state.machine.machinetype}</strong> effectué le <strong>${new Date().toLocaleDateString()}</strong> par l'employé <strong>${(await sp.web.currentUser.get()).Title}</strong> n'est pas conforme.</p>                
                </table>
             
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
      `;

      try {
        await sp.utility.sendEmail({
          To: [toEmail],
          Subject: subject,
          Body: body,
         
        });

        console.log("Email sent successfully.");
      } catch (error) {
        console.log("Error sending email:", error);
      }
    
  };




  private handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      const machine: IMachine[] = await sp.web.lists.getByTitle("Machine").items.filter(`marking eq '${this.state.num}'`).get();
      if(machine.length == 0){
       
        console.log("machine n'existe pas");
        this.setState({ showAdditionalFields: false, machineExistpas : true});
      }else{
        const characteristics: ICharacteristic[] = await sp.web.lists.getByTitle('Characteristic').items.select('id_char', 'value', 'limSup', 'limInf','marking').filter(`marking eq '${this.state.num}'`).get();
        const summaries: ISummary[] = await sp.web.lists.getByTitle("Summary").items.filter(`marking eq '${this.state.num}'`).get();
       
  
        const Data: IData[] = [];
        const len = [];
        for (let i = 0; i < characteristics.length; i++) {
          const vals = [];
          const dates = [];
          for (const summary of summaries) {
            if (Number(summary.characteristic) == i) {
  
              vals.push(summary.value);
              dates.push(summary.date);
            }
          }
          const data: IData = { vals, dates };
          len.push(vals.length);
  
          Data.push(data);
        }
        const datas = Data.map((data) => ({ ...data }));
  
  
        this.setState({ showAdditionalFields: true, characteristics, machine: machine[0], summaries: summaries, datas, len })
      }
     
    } catch (error) {
      console.log(`Erreur lors de cnx a la liste  : `, error);
    }


  };

  private handleAdditionalFieldsSubmit = async (): Promise<void> => {
    event.preventDefault();
    var conformityTotal = true;
    if (1) {
      this.setState({ showAdditionalFields: false, isSubmitting: true, isSubmissionSuccessful: false });
      const { characteristics } = this.state; // Utilisation de la déstructuration pour obtenir la liste des caractéristiques
      try {
        const list = sp.web.lists.getByTitle("Characteristic");
        
        for (const characteristic of characteristics) { // Utilisation d'une boucle for pour itérer sur les caractéristiques
          const item = list.items.getById(Number(characteristic.id_char)+1); 
          console.log("---->",list.items.get()) ;
          if (!(characteristic.limInf <= characteristic.val && characteristic.val <= characteristic.limSup)) {
            conformityTotal = false;
            this.sendEmail();
            console.log("conformityTotal" + conformityTotal);
          }
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
          id_ctl: newId,
          conformity: conformityTotal
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
        for (const characteristic of characteristics) { // Utilisation d'une boucle for pour itérer sur les caractéristiques

          var UID = d + NID;
          const newItemSummary = {
            Title: "title",
            marking: this.state.machine.marking,
            characteristic: String(d),
            value: characteristic.val,
            limInf: characteristic.limInf,
            limSup: characteristic.limSup,
            conformity: (characteristic.limInf <= characteristic.val && characteristic.val <= characteristic.limSup),
            machinetype: this.state.machine.machinetype,
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
              // Recharger la page après 5 secondes
              setTimeout(() => {location.reload(); }, 1000);
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

    console.log("datas : " + this.state.datas[0].vals);
    const characteristics = [...this.state.characteristics];
    const target = event.target as HTMLInputElement;
    const v = target.value;
    let colors = [...this.state.colors]; // Copiez l'état actuel des couleurs
    if (v != null && v != '') {
      characteristics[index].val = Number(v);
      console.log(Number(v));
      console.log(characteristic.limInf);
      console.log(characteristic.limSup);
      if (characteristic.limInf && Number(v) < characteristic.limInf) {
        colors[index] = 'red'; // Mettez à jour la couleur dans l'état colors
      } else if (characteristic.limSup && Number(v) > characteristic.limSup) {
        colors[index] = 'red'; // Mettez à jour la couleur dans l'état colors
      } else {
        colors[index] = 'green'; // Mettez à jour la couleur dans l'état colors
      }
    } else {
      colors[index] = 'black';
    }
    // Faites une copie de this.state.datas2
    const dt = this.state.datas.map((data) => ({ ...data }));
    const graphVal = Number(v);
    const graphDate = new Date().toISOString();
    const point = { val: graphVal, date: graphDate };
    const len = this.state.len[index];
    // Assurez-vous que index est un index valide pour accéder aux éléments de dt

    dt[index].vals[len] = (point.val);
    dt[index].dates[len] = (point.date);
    const datas = dt.map((data) => ({ ...data }));
    // Mettez à jour l'état datas avec dt et les autres valeurs mises à jour
    this.setState({ datas, characteristics, colors }, () => {
      this.forceUpdate();
    });

  };
  private formatDates = (dates: string[]) => {
    return dates.map(dateString => {
      const date = new Date(dateString);
      const day = ('0' + date.getDate()).slice(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear().toString().slice(-2);
      return `${day}-${month}-${year}`;
    });
  }

 

  public render(): React.ReactElement<IFormProps> {
    const { isSubmitting, isSubmissionSuccessful } = this.state;

    if (isSubmissionSuccessful) {
      return (
        <SuccessMessage/>
      );
    }


    

    const chartDataf = (index: number) => {
      
      const dataMinusOneLength = this.state.datas[index].vals.length - 1;
      const colors = [];

      for (let i = 0; i < dataMinusOneLength; i++) {
        colors.push('rgba(75, 192, 192)');
      }

      colors.push(this.state.colors[index]);
      const data = [...this.state.datas[index].vals];
      const label = [...this.state.datas[index].dates];
     
      const limInfArray = [];
      const limSupArray = [];
      const l = data.length > 7 ? data.length : 7;
      for (let i = 0; i < l; i++) {
        limInfArray.push(this.state.characteristics[index].limInf);
        limSupArray.push(this.state.characteristics[index].limSup);
      }

      return {
        labels: this.formatDates(label),
        datasets: [
          {
            label: "Valeur",
            data: data,
            borderColor: 'rgba(75, 192, 192, 0.8)', // Set the color for the line
            pointBorderColor: colors, // Set the color for the last value
            pointBackgroundColor: colors, // Set the color for the last value
            pointBorderWidth: 2,
            fill: false
          },
          {
            label: "LimSup",
            data: limSupArray,
            borderColor: "rgba(255, 99, 132)", // Set the color for the line
            borderWidth: 2,
            pointBorderColor: 'rgba(100,100,100,0)', // Set the color for the last value
            pointBackgroundColor: 'rgba(100,100,100,0)', // Set the color for the last value
            fill: false
          },
          {
            label: "LimInf",
            data: limInfArray,
            borderWidth: 2,
            borderColor: "rgba(255, 99, 132)", // Set the color for the line
            pointBorderColor: 'rgba(100,100,100,0)', // Set the color for the last value
            pointBackgroundColor: 'rgba(100,100,100,0)', // Set the color for the last value
            fill: false
          }

        ]
      }
    };
    const chartOptions = {
      scales: {
        x: {
          ticks: {
            display: false // Masquer les labels sur l'axe des x
          }
        },
        y: {
          ticks: {
            display: false // Masquer les labels sur l'axe des y
          }
        }
      }
    };

    return (
      <div>
        {isSubmitting && !isSubmissionSuccessful ? (
          // Afficher un spinner de chargement pendant la soumission du formulaire
          <Spinner size={SpinnerSize.large} label={"Chargement ..."} />
        ) : (
          this.state.showAdditionalFields == false && !isSubmissionSuccessful && !isSubmitting && (
            <form onSubmit={this.handleSubmit}>
              <div className={styles["container"]} >
                <div className={styles["container-close"]} >MV</div>
                <img
                  src={require('../assets/Metro.png')}
                  alt="image" />
                <div className={styles["container-text"]}  >
                  <h2> Bienvenue à  <br /><span style={{ color: "rgba(186,71,64,1) !important", fontSize: "22px !important" }}>MetroViz</span></h2>
                  <p>La plateforme de visualisation des données pour le département de métrologie. <br /><br />  *Veuillez fournir les données requises. <br /></p>
                  <TextField className={styles['textField']} onChange={this.handleNameChange} type="number" value={this.state.num} placeholder='Numero de Machine' required />
                  {this.state.machineExistpas && (
                          <Text variant="small" style={{ color: 'red', textAlignLast: 'right', marginBottom: "20px",marginTop: "-10px" }} className='text-right'>
                            machine n'existe pas !
                          </Text>
                        )}
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
                <li><span className={styles["list-title"]}>Type :</span>{this.state.machine.machinetype}</li>
              </ul>
            </div>
            <div className={styles["container12"]}>
              <form className={styles["form2"]}>
                {this.state.characteristics.map((characteristic, index) => (
                  <div className={styles["container121"]}>
                    <div className={styles["container121-text"]}> <ChartControl
                      key={index}
                      type="line"
                      data={chartDataf(index)}
                      options={chartOptions}

                    /> </div>
                    <Stack key={characteristic.id_char} verticalAlign="center" tokens={{ childrenGap: 10 }}>
                      <div className={styles["container121-text"]}>
                        <TextField
                          key={characteristic.id_char}
                          placeholder={"valeur : " + (index + 1) + "..."}
                          defaultValue={characteristic.val ? String(characteristic.val) : ""}
                          id={`val-${characteristic.id_char}`}
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
                            valeur hors plage
                          </Text>
                        )}
                        {this.state.colors[index] === 'green' && (
                          <Text variant="small" style={{ color: 'green', textAlign: 'right' }} className='text-right'>
                            valueur valide
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
                    closeButtonAriaLabel: "",
                    subText: 'Êtes-vous sûr(e) de vouloir soumettre le formulaire ?'
                  }}
                  modalProps={{
                    isBlocking: true,
                    styles: { main: { maxWidth: 550 } }
                  }}
                >
                  <DialogFooter>
                    <button style={{ color: "rgb(75, 192, 192)", padding: "5px 8px", backgroundColor: "rgba(75, 192, 192, 0.5)", border: "none", cursor:"pointer"}} onClick={this.handleConfirm}>Envoyer</button>
                    <button style={{ color: "rgba(255, 99, 132)", padding: "5px 8px", backgroundColor: "rgba(255, 99, 132, 0.5)", border: "none", cursor:"pointer" }} onClick={this.handleCancel}>Annuler</button>
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
