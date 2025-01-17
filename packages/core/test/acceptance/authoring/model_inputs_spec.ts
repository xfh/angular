/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, EventEmitter, Input, model, OnChanges, Output, signal, SimpleChange, SimpleChanges, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('model inputs', () => {
  it('should support two-way binding to a signal', () => {
    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model(0);
    }

    @Component({
      template: '<div [(value)]="value" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = signal(1);
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    // Initial value.
    expect(host.value()).toBe(1);
    expect(host.dir.value()).toBe(1);

    // Changing the value from within the directive.
    host.dir.value.set(2);
    expect(host.value()).toBe(2);
    expect(host.dir.value()).toBe(2);

    // Changing the value from the outside.
    host.value.set(3);
    fixture.detectChanges();
    expect(host.value()).toBe(3);
    expect(host.dir.value()).toBe(3);
  });

  it('should support two-way binding to a non-signal value', () => {
    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model(0);
    }

    @Component({
      template: '<div [(value)]="value" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = 1;
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    // Initial value.
    expect(host.value).toBe(1);
    expect(host.dir.value()).toBe(1);

    // Changing the value from within the directive.
    host.dir.value.set(2);
    expect(host.value).toBe(2);
    expect(host.dir.value()).toBe(2);

    // Changing the value from the outside.
    host.value = 3;
    fixture.detectChanges();
    expect(host.value).toBe(3);
    expect(host.dir.value()).toBe(3);
  });

  it('should support two-way binding a signal to a non-model input/output pair', () => {
    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      @Input() value = 0;
      @Output() valueChange = new EventEmitter<number>();
    }

    @Component({
      template: '<div [(value)]="value" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = signal(1);
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    // Initial value.
    expect(host.value()).toBe(1);
    expect(host.dir.value).toBe(1);

    // Changing the value from within the directive.
    host.dir.value = 2;
    host.dir.valueChange.emit(2);
    fixture.detectChanges();
    expect(host.value()).toBe(2);
    expect(host.dir.value).toBe(2);

    // Changing the value from the outside.
    host.value.set(3);
    fixture.detectChanges();
    expect(host.value()).toBe(3);
    expect(host.dir.value).toBe(3);
  });

  it('should support a one-way property binding to a model', () => {
    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model(0);
    }

    @Component({
      template: '<div [value]="value" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = 1;
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    // Initial value.
    expect(host.value).toBe(1);
    expect(host.dir.value()).toBe(1);

    // Changing the value from within the directive.
    host.dir.value.set(2);
    fixture.detectChanges();
    expect(host.value).toBe(1);
    expect(host.dir.value()).toBe(2);

    // Changing the value from the outside.
    host.value = 3;
    fixture.detectChanges();
    expect(host.value).toBe(3);
    expect(host.dir.value()).toBe(3);
  });

  it('should emit to the change output when the model changes', () => {
    const emittedValues: number[] = [];

    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model(0);
    }

    @Component({
      template: '<div (valueChange)="changed($event)" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;

      changed(value: number) {
        emittedValues.push(value);
      }
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    expect(emittedValues).toEqual([]);

    host.dir.value.set(1);
    fixture.detectChanges();
    expect(emittedValues).toEqual([1]);

    // Same value should not emit.
    host.dir.value.set(1);
    fixture.detectChanges();
    expect(emittedValues).toEqual([1]);

    host.dir.value.update(value => value * 5);
    fixture.detectChanges();
    expect(emittedValues).toEqual([1, 5]);
  });

  it('should not emit to the change event when then property binding changes', () => {
    const emittedValues: number[] = [];

    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model(0);
    }

    @Component({
      template: '<div [value]="value()" (valueChange)="changed($event)" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = signal(1);

      changed(value: number) {
        emittedValues.push(value);
      }
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    expect(emittedValues).toEqual([]);

    host.value.set(2);
    fixture.detectChanges();
    expect(emittedValues).toEqual([]);
  });

  it('should support binding to the model input and output separately', () => {
    const emittedValues: number[] = [];

    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model(0);
    }

    @Component({
      template: '<div [value]="value()" (valueChange)="changed($event)" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = signal(1);

      changed(value: number) {
        emittedValues.push(value);
      }
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    expect(host.value()).toBe(1);
    expect(host.dir.value()).toBe(1);
    expect(emittedValues).toEqual([]);

    host.dir.value.set(2);
    fixture.detectChanges();
    expect(host.value()).toBe(1);
    expect(host.dir.value()).toBe(2);
    expect(emittedValues).toEqual([2]);

    host.value.set(3);
    fixture.detectChanges();
    expect(host.value()).toBe(3);
    expect(host.dir.value()).toBe(3);
    expect(emittedValues).toEqual([2]);
  });

  it('should support two-way binding to a model with an alias', () => {
    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model(0, {alias: 'alias'});
    }

    @Component({
      template: '<div [(alias)]="value" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = signal(1);
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    // Initial value.
    expect(host.value()).toBe(1);
    expect(host.dir.value()).toBe(1);

    // Changing the value from within the directive.
    host.dir.value.set(2);
    fixture.detectChanges();
    expect(host.value()).toBe(2);
    expect(host.dir.value()).toBe(2);

    // Changing the value from the outside.
    host.value.set(3);
    fixture.detectChanges();
    expect(host.value()).toBe(3);
    expect(host.dir.value()).toBe(3);
  });

  it('should support binding to an aliased model input and output separately', () => {
    const emittedValues: number[] = [];

    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model(0, {alias: 'alias'});
    }

    @Component({
      template: '<div [alias]="value()" (aliasChange)="changed($event)" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = signal(1);

      changed(value: number) {
        emittedValues.push(value);
      }
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    expect(host.value()).toBe(1);
    expect(host.dir.value()).toBe(1);
    expect(emittedValues).toEqual([]);

    host.dir.value.set(2);
    fixture.detectChanges();
    expect(host.value()).toBe(1);
    expect(host.dir.value()).toBe(2);
    expect(emittedValues).toEqual([2]);

    host.value.set(3);
    fixture.detectChanges();
    expect(host.value()).toBe(3);
    expect(host.dir.value()).toBe(3);
    expect(emittedValues).toEqual([2]);
  });

  it('should throw if a required model input is accessed too early', () => {
    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model.required<number>();

      constructor() {
        this.value();
      }
    }

    @Component({
      template: '<div [(value)]="value" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      value = 1;
    }

    expect(() => TestBed.createComponent(App))
        .toThrowError(/Model is required but no value is available yet/);
  });

  it('should throw if a required model input is updated too early', () => {
    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model.required<number>();

      constructor() {
        this.value.update(prev => prev * 2);
      }
    }

    @Component({
      template: '<div [(value)]="value" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      value = 1;
    }

    expect(() => TestBed.createComponent(App))
        .toThrowError(/Model is required but no value is available yet/);
  });

  it('should stop emitting to the output on destroy', () => {
    let emittedEvents = 0;

    @Directive({selector: '[dir]', standalone: true})
    class Dir {
      value = model(0);
    }

    @Component({
      template: '<div (valueChange)="changed()" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;

      changed() {
        emittedEvents++;
      }
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const modelRef = fixture.componentInstance.dir.value;
    expect(emittedEvents).toBe(0);

    modelRef.set(1);
    fixture.detectChanges();
    expect(emittedEvents).toBe(1);

    fixture.destroy();
    modelRef.set(2);
    expect(emittedEvents).toBe(1);
  });

  it('should support inherited model inputs', () => {
    @Directive()
    abstract class BaseDir {
      value = model(0);
    }

    @Directive({selector: '[dir]', standalone: true})
    class Dir extends BaseDir {
    }

    @Component({
      template: '<div [(value)]="value" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = signal(1);
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    // Initial value.
    expect(host.value()).toBe(1);
    expect(host.dir.value()).toBe(1);

    // Changing the value from within the directive.
    host.dir.value.set(2);
    fixture.detectChanges();
    expect(host.value()).toBe(2);
    expect(host.dir.value()).toBe(2);

    // Changing the value from the outside.
    host.value.set(3);
    fixture.detectChanges();
    expect(host.value()).toBe(3);
    expect(host.dir.value()).toBe(3);
  });

  it('should reflect changes to a two-way-bound signal in the DOM', () => {
    @Directive({
      selector: '[dir]',
      standalone: true,
      host: {
        '(click)': 'increment()',
      }
    })
    class Dir {
      value = model(0);

      increment() {
        this.value.update(previous => previous + 1);
      }
    }

    @Component({
      template: '<button [(value)]="value" dir></button> Current value: {{value()}}',
      standalone: true,
      imports: [Dir],
    })
    class App {
      value = signal(1);
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Current value: 1');

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Current value: 2');

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Current value: 3');
  });

  it('should support ngOnChanges for two-way model bindings', () => {
    const changes: SimpleChange[] = [];

    @Directive({selector: '[dir]', standalone: true})
    class Dir implements OnChanges {
      value = model(0);

      ngOnChanges(allChanges: SimpleChanges): void {
        if (allChanges['value']) {
          changes.push(allChanges['value']);
        }
      }
    }

    @Component({
      template: '<div [(value)]="value" dir></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = signal(1);
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(changes).toEqual([jasmine.objectContaining({
      previousValue: undefined,
      currentValue: 1,
      firstChange: true,
    })]);

    fixture.componentInstance.value.set(2);
    fixture.detectChanges();

    expect(changes).toEqual([
      jasmine.objectContaining({
        previousValue: undefined,
        currentValue: 1,
        firstChange: true,
      }),
      jasmine.objectContaining({
        previousValue: 1,
        currentValue: 2,
        firstChange: false,
      }),
    ]);
  });
});
