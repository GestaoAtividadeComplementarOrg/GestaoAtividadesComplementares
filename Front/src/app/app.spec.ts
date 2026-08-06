import { TestBed } from '@angular/core/testing';
import { App } from './app.component'; // ou AppComponent se essa for a classe
import { describe, it, expect, beforeEach } from 'vitest';

describe('App Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
