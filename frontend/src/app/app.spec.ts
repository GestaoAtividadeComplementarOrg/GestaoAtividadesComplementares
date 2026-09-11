import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, NavigationEnd, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from './app';

@Component({ template: '' })
class FakeLoginComponent {}

describe('App Component', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let routerEvents: Subject<unknown>;

  beforeEach(async () => {
    routerEvents = new Subject();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([{ path: 'login', component: FakeLoginComponent }]),
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        {
          provide: Router,
          useValue: { events: routerEvents.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve marcar isLandingPage como true na rota raiz', () => {
    routerEvents.next(new NavigationEnd(1, '/', '/'));
    expect(component.isLandingPage).toBe(true);
  });

  it('deve marcar isLandingPage como false em rotas internas', () => {
    routerEvents.next(new NavigationEnd(2, '/dashboard', '/dashboard'));
    expect(component.isLandingPage).toBe(false);
  });
});
