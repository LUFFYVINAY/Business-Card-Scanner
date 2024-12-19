import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ExportService } from './services/export.services';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [BrowserModule, AppComponent,FormsModule],
  providers: [ExportService],
  // bootstrap: [AppComponent]
})
export class AppModule {}
