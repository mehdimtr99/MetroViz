import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IFormProps } from './components/IFormProps';
import Form from './components/Form';

export default class FormWebPart extends BaseClientSideWebPart<IFormProps> {

  public render(): void {
    const element: React.ReactElement<IFormProps> = React.createElement(
      Form,
      {}
    );

    ReactDOM.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    this.render();
    return Promise.resolve();
  }

  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(this.domElement);
  }
}
