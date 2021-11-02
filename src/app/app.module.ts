import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KonvaModule } from 'ng2-konva';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { HttpHeaderInterseptor } from './http-header-interceptor';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    KonvaModule,
    ColorPickerModule,
    FormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpHeaderInterseptor,
      multi: true
    }
  ],
  // declarations:[

  //   ColorPickerModule
  // ],
  // exports: [ColorPickerModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
