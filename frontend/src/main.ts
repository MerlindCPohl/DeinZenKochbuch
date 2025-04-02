import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

function removePreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.display = 'none';
  }
}

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    removePreloader();
  })
  .catch((err) => console.error(err));
