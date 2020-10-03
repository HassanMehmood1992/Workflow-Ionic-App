import { Component, Input, OnInit } from '@angular/core';

/**
 * Generated class for the FormListItemComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'form-list-item',
  templateUrl: 'form-list-item.html'
})
export class FormListItemComponent implements OnInit{

  text: string;
  @Input() row: any;
  @Input() data: any;
  @Input() displaycols: any;
  @Input() columnOptions: any;
  @Input() column: any;
  @Input() cols: any;

  constructor() {
    console.log('Hello FormListItemComponent Component');
    this.text = 'Hello World';
    alert(this.row)
  }
  ngOnInit()
  {
    alert('here')
  }

}
