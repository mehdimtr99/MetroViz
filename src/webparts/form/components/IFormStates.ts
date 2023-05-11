import { IPoint } from "./IPoint";
import { ICharacteristic } from "./ICharacteristic";
import { IControl } from "./IControl";
import { IData } from "./IData";
import { IMachine } from "./IMachine";
import { ISummary } from "./ISummary";

export interface IFormStates {
  num: string,
  showAdditionalFields: boolean,
  characteristics: ICharacteristic[],
  values: number[],
  colors: string[],
  isSubmitting: boolean,
  isSubmissionSuccessful: boolean,
  machine: IMachine,
  control: IControl,
  summary: ISummary,
  newId: number,
  showDialog: boolean,
  summaries: ISummary[],
  datas: IData[],
  datas2: IData[],
  point : IPoint,
  len : number[]
}
