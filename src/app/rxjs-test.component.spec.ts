import { TestBed, async } from '@angular/core/testing';
import { RxJsTestingComponent } from './rxjs-test.component';
import { cold, hot } from 'jasmine-marbles';
import {
  of,
  throwError,
  interval,
  from,
  concat,
  merge,
  empty,
  Observable,
  combineLatest,
  Subject,
  BehaviorSubject,
  ReplaySubject
} from 'rxjs';
import {
  take,
  startWith,
  bufferCount,
  concatMap,
  delay,
  filter,
  skip,
  last,
  map,
  mapTo,
  groupBy,
  mergeMap,
  toArray,
  scan,
  first
} from 'rxjs/operators';
import { debug } from 'util';

const noop = () => { };

describe('RxJsTestingComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RxJsTestingComponent
      ],
    }).compileComponents();
  }));
  describe('Marble testing basics', () => {
    it('should understand marble diagram', () => {
      const source = cold('--');
      const expected = cold('--');

      expect(source).toBeObservable(expected);
    });

    describe('cold observable', () => {
      it('should support basic string values', () => {
        const source = cold('-a-|');
        const expected = cold('-a-|');

        expect(source).toBeObservable(expected);
      });

      it('should support basic values provided as params (number)', () => {
        const source = cold('-a-|', { a: 1 });
        const expected = cold('-a-|', { a: 1 });

        expect(source).toBeObservable(expected);
      });

      it('should support basic values provided as params (object)', () => {
        const source = cold('-a-|', { a: { key: 'value' } });
        const expected = cold('-a-|', { a: { key: 'value' } });

        expect(source).toBeObservable(expected);
      });

      it('should support custom errors', () => {
        const source = cold('--#', null, new Error('Oops!'));
        const expected = cold('--#', null, new Error('Oops!'));

        expect(source).toBeObservable(expected);
      });

      it('should support multiple emission in the same time frame', () => {
        const source = of(1, 2, 3);
        const expected = cold('(abc|)', { a: 1, b: 2, c: 3 });

        expect(source).toBeObservable(expected);
      });
    });

    describe('hot observable', () => {
      it('should support basic hot observable', () => {
        const source = hot('-^a-|', { a: 5 });
        const expected = cold('-a-|', { a: 5 });

        expect(source).toBeObservable(expected);
      });
    });
  });

  describe('creating of Observable', () => {
    it('should create sync observable with of', () => {
      const source = of(1, 2, 3);
      const expected = cold('(abc|)', { a: 1, b: 2, c: 3 });

      expect(source).toBeObservable(expected);
    });

    it('should create empty observable', () => {
      const source = empty();
      const expected = cold('|');

      expect(source).toBeObservable(expected);
    });

    it('should create observable which was error', () => {
      const errorMsg = 'Error';
      const source = throwError(errorMsg);

      source.subscribe(
        noop,
        (err) => expect(err).toBe(errorMsg));
    });

    it('should create custom observable', () => {
      const source = Observable.create((observer) => {
        observer.next('a');
        observer.next('b');
        setTimeout(() => {
          observer.next('c');
          observer.complete();
        }, 10);
      });

      const count = [];

      source.subscribe(
        (x) => {
          count.push(x);
        },
        noop,
        () => {
          expect(count.length).toBe(3);
          expect(count).toEqual(['a', 'b', 'c']);
        });
    });

    it('should create sync observable with from and make it async with concatMap and delay()', (done) => {
      const observableValueArray = [1, 2, 3, 4];
      const source = from(observableValueArray).pipe(concatMap(x => of(x).pipe(delay(10))));
      const count = [];
      source.subscribe(
        (x) => {
          count.push(x);
        },
        noop,
        () => {
          expect(count.length).toBe(observableValueArray.length);
          expect(count).toEqual(observableValueArray);
          done();
        });
    });

    it('should create async observable with interval and always start with defined value', (done) => {
      const startstWith = 10;
      const observableLenght = 5;
      const count = [];

      const source = interval(10).pipe(startWith(startstWith), take(observableLenght));
      source.subscribe(
        (x) => {
          count.push(x);
        },
        noop,
        () => {
          expect(count.length).toBe(observableLenght);
          expect(count[0]).toBe(startstWith);
          done();
        });
    });

    describe('Subject', () => {
      it('should be an Observable', () => {
        const subject = new Subject();
        const expected = cold('-');
        expect(subject).toBeObservable(expected);
      });

      describe('BehaviorSubject', () => {
        it('when subscribing to it always starts with emitting the last value', () => {
          const subject = new BehaviorSubject('start');
          subject.subscribe(value => {
            expect(value).toBe('start');
          });
        });
      });

      describe('ReplaySubject', () => {
        it('when subscribing to it emits all old values', () => {
          const subject = new ReplaySubject();
          const valuesA = [];
          const valuesB = [];
          subject.subscribe(val => {
            valuesA.push(val);
          });
          subject.next(1);
          subject.next(2);
          subject.next(3);

          subject.subscribe(val => {
            valuesB.push(val);
          });

          expect(valuesA).toEqual(valuesB);
        });
      });
    });
  });

  describe('Observable operators -->', () => {
    describe('Combination Operators', function () {
      describe('Concat', () => {
        it('should concat 2 observables one after another when the first is completed', function (done) {
          const first1$ = from(['a', 'b', 'c', 'd']);
          const second2$ = from(['e', 'f']);
          const values1 = [];
          const expected1 = ['a', 'b', 'c', 'd', 'e', 'f'];

          concat(first1$, second2$).subscribe(
            function (val) { values1.push(val); },
            noop,
            function () { expect(true).toEqual(true); done(); }
          );


        });

        it('should concat 2 BehaviorSubject one after another when the first is completed', function () {
          const first$ = new BehaviorSubject(1);
          const second$ = new BehaviorSubject(2);
          const values = [];
          const expected = [1, 3, 4];

          concat(first$, second$).subscribe(
            val => values.push(val),
            noop,
            () => { expect(values).toEqual(expected); });

          first$.next(3);
          second$.next(4);
          first$.complete();
          second$.complete();
        });

      });
      describe('Merge', function () {
        it('should merge 2 BehaviorSubject in one', function (done) {

          const first$ = new BehaviorSubject(1);
          const second$ = new BehaviorSubject(2);
          const values = [];
          const expected = [1, 2, 3, 4];



          merge(first$, second$).subscribe(
            val => values.push(val),
            noop,
            () => { expect(values).toEqual(expected); done(); });

          first$.next(3);
          second$.next(4);
          first$.complete();
          second$.complete();
        });
      });

      describe('CombineLatest', () => {
        it('should combine latest values from 2 observable whenever any of the observables emits a value', () => {
          const first$ = hot('----a-|');
          const second$ = hot('--d-|');
          const combined$ = combineLatest(first$, second$, (a, b) => '' + a + b);

          combined$.subscribe(val => {
            expect(val).toBe('ad');
          });
        });
      });
    });

    describe('Filtering Operators', () => {
      describe('Filter', () => {
        it('should filter the emited values by given function', () => {
          const first$ = cold('-a--b--c-d-|', { a: 0, b: 1, c: 2, d: 3 });
          const expected = [0, 2];
          const values = [];
          const source$ = first$.pipe(filter(val => val % 2 === 0))
            .subscribe(val => values.push(val),
              noop,
              () => expect(values).toEqual(expected));
        });
      });

      describe('Take', () => {
        it('should take only first N values from observable', () => {
          const first$ = cold('-a--b--c-d-|', { a: 0, b: 1, c: 2, d: 3 });
          const expected = [0, 1];
          const values = [];
          const source$ = first$.pipe(take(2))
            .subscribe(val => values.push(val),
              noop,
              () => expect(values).toEqual(expected));
        });
      });

      describe('Skip', () => {
        it('should skip first N values from observable', () => {
          const first$ = cold('-a--b--c-d-|', { a: 0, b: 1, c: 2, d: 3 });
          const expected = [2, 3];
          const values = [];
          const source$ = first$.pipe(skip(2))
            .subscribe(val => values.push(val),
              noop,
              () => expect(values).toEqual(expected));
        });
      });

      describe('Last', () => {
        it('should emit only the last value from observable', () => {
          const first$ = cold('-a--b--c-d-|', { a: 0, b: 1, c: 2, d: 3 });
          const expected = [3];
          const values = [];
          const source$ = first$.pipe(last())
            .subscribe(val => values.push(val),
              noop,
              () => expect(values).toEqual(expected));
        });
      });
    });

    describe('Transformation Operators', () => {
      describe('Map', () => {
        it('should transform the emitted value with given function', () => {
          const first$ = cold('-a--b--c-d-|', { a: 0, b: 1, c: 2, d: 3 });
          const expected = [1, 2, 3, 4];
          const values = [];
          const source$ = first$.pipe(map(val => val + 1))
            .subscribe(val => values.push(val),
              noop,
              () => expect(values).toEqual(expected));
        });
      });

      describe('MapTo', () => {
        it('should map every emitted value to the same output every time', () => {
          const first$ = cold('-a--b--c-d-|', { a: 0, b: 1, c: 2, d: 3 });
          const expected = ['with Map', 'with Map', 'with Map', 'with Map'];
          const values = [];
          const source$ = first$.pipe(mapTo('with Map'))
            .subscribe(val => values.push(val),
              noop,
              () => expect(values).toEqual(expected));
        });
      });

      // bufferCount(2) === pairwise()
      describe('BufferCount', () => {
        it('should collect N emitted values to one and emit as array ', () => {
          const first$ = cold('-a--b--c-d-|', { a: 0, b: 1, c: 2, d: 3 });
          const expected = [[0, 1], [2, 3]];
          const values = [];
          const source$ = first$.pipe(bufferCount(2))
            .subscribe(val => values.push(val),
              noop,
              () => expect(values).toEqual(expected));
        });
      });

      describe('Scan', () => {
        it('should work like Array.reduce() method', () => {
          const first$ = cold('-a--b--c-d-|', { a: 1, b: 2, c: 3, d: 4 });
          const expected = [1, 3, 6, 10];
          const values = [];
          const source$ = first$.pipe(scan((acc, current) => acc + current, 0))
            .subscribe(val => values.push(val),
              noop,
              () => expect(values).toEqual(expected));
        });
      });

      describe('GroupBy with MergeMap', () => {
        it('should group values into observable based on provided function and with MergeMap will return array for each group', () => {
          const people = [
            { name: 'Sue', age: 25 },
            { name: 'Joe', age: 30 },
            { name: 'Frank', age: 25 },
            { name: 'Sarah', age: 35 }
          ];
          const first$ = from(people);
          const expected = [
            [{ name: 'Sue', age: 25 }, { name: 'Frank', age: 25 }],
            [{ name: 'Joe', age: 30 }],
            [{ name: 'Sarah', age: 35 }]
          ];
          const values = [];
          const source$ = first$.pipe(groupBy(person => person.age), mergeMap(group$ => group$.pipe(toArray())))
            .subscribe(val => values.push(val),
              noop,
              () => expect(values).toEqual(expected));
        });
      });
    });

  });
});
