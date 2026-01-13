import { Routes } from '@angular/router';
import { ShopComponent } from './components/shop/shop.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShopComponent,
    pathMatch: 'full',
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/admin-layout/admin-layout.component').then(c => c.AdminLayoutComponent),
    children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard', loadComponent: () => import('./admin/dashboard/dashboard.component').then(c => c.DashboardComponent) },
        { path: 'users', loadComponent: () => import('./admin/users/user-management.component').then(c => c.UserManagementComponent) },
        { path: 'products', loadComponent: () => import('./admin/products/product-management.component').then(c => c.ProductManagementComponent) },
        { path: 'orders', loadComponent: () => import('./admin/orders/order-management.component').then(c => c.OrderManagementComponent) },
        { path: 'settings', loadComponent: () => import('./admin/settings/settings.component').then(c => c.SettingsComponent) },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
