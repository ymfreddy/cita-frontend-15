import { MenuItem } from 'src/app/shared/models/menu-item.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  public appDrawer: any;
  public currentUrl = new BehaviorSubject<string>('');
  public activeRoute$ = new Subject<MenuItem>();

  private item!: MenuItem;
  private items: MenuItem[] = [];

  constructor() { }

  public closeNav(): void {
    this.appDrawer.close();
  }

  public openNav(): void {
    this.appDrawer.open();
  }

  public getMenuItems(): MenuItem[] {
    return this.items;
  }

  public setActiveRoute(navItem: MenuItem): void {
    this.activeRoute$.next(navItem);
  }

  public getActiveRoute(): Observable<MenuItem> {
    return this.activeRoute$.asObservable();
  }
}
