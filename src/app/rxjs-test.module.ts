import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RxJsTestingComponent } from './rxjs-test.component';

@NgModule({
  declarations: [
    RxJsTestingComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [RxJsTestingComponent]
})
export class RxJsTestingModule { }
