import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { MyrecipesComponent } from './myrecipes/myrecipes.component';
import { NewrecipeComponent } from './newrecipe/newrecipe.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './shared/auth/auth.guard';
import { UserSettingsComponent } from './user-settings/user-settings.component'; // Importieren Sie diese Komponente

export const routes: Routes = [
  { path: "myrecipes", title: "My Recipes", component: MyrecipesComponent, canActivate: [AuthGuard] },
  { path: "login", title: "Login", component: LoginComponent },
  { path: "", title: "Home", component: HomeComponent, pathMatch: 'full' },
  { path: "home", redirectTo: "", pathMatch: 'full' }, // Fügen Sie diese Zeile hinzu
  { path: "newrecipe", title: "Recipe", component: NewrecipeComponent, canActivate: [AuthGuard] },
  { path: "register", title: "Register", component: RegisterComponent },
  { path: "user-settings", title: "User Settings", component: UserSettingsComponent, canActivate: [AuthGuard] }, // Fügen Sie diese Zeile hinzu
  { path: "**", redirectTo: "" },
];
