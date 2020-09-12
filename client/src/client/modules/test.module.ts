import { NgModule } from '@angular/core';
import { CommonModule, APP_BASE_HREF } from '@angular/common';
import { AppModule } from '../app.module';
import {MockComponent} from '../mocks/mock.component';


@NgModule({
    declarations: [
      MockComponent
    ],
    exports: [
        CommonModule,
        AppModule
    ],
    providers: [
        { provide: APP_BASE_HREF, useValue: '/' }
    ]
})
export class TestModule { }
