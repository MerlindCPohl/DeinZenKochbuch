import {Component, NgModule} from '@angular/core';
import {HeaderComponent} from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import {RouterOutlet} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './shared/components/error-dialog/error-dialog.component'; // Pass den Pfad an
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from './services/notification.service';


@NgModule({
  imports: [
    MatSnackBarModule
  ]
})
export class AppModule { }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'firstfrontend';

  constructor(private dialog: MatDialog, private notificationService: NotificationService) { }
    openErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        title: 'Fehler',
        message: message
      }
    });
  }
}
