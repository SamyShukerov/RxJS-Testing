import { Component, OnInit } from '@angular/core';
import { fromEvent, concat, of, interval, empty, never } from 'rxjs';
import { groupBy, flatMap, reduce, mergeMap, map, filter, catchError, retry, concatMap, delay, startWith, take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './rxjs-test.component.html'
})
export class RxJsTestingComponent implements OnInit {
  title = 'RxJS testing';

  ngOnInit() {  }

}
