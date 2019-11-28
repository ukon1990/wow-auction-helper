import { NgModule } from '@angular/core';
import { CommonModule, APP_BASE_HREF } from '@angular/common';
import { AppModule } from '../app.module';


@NgModule({
    exports: [
        CommonModule,
        AppModule
    ],
    providers: [
        { provide: APP_BASE_HREF, useValue: '/' }
    ]
})
export class TestModule { }
