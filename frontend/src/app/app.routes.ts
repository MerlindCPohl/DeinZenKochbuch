import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { MyrecipesComponent } from './myrecipes/myrecipes.component';
import { NewrecipeComponent } from './newrecipe/newrecipe.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './shared/auth/auth.guard';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { AllrecipesComponent } from './allrecipes/allrecipes.component';
import { MonthsComponent } from './months/months.component';


export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: 'full' },
  { path: "register", title: "Register", component: RegisterComponent },
  { path: "login", title: "Login", component: LoginComponent },
  { path: "home", title: "Home", component: HomeComponent },
  { path: "myrecipes", title: "My Recipes", component: MyrecipesComponent, canActivate: [AuthGuard] },
  { path: "newrecipe", title: "Recipe", component: NewrecipeComponent, canActivate: [AuthGuard] },
  { path: "user-settings", title: "User Settings", component: UserSettingsComponent, canActivate: [AuthGuard] },
  { path: "allrecipes", title: "Alle Rezepte", component: AllrecipesComponent },
  { path: "months", component: MonthsComponent, canActivate: [AuthGuard] },
  { path: "**", redirectTo: "login" } //fallback falss falsche url eingabe

];
