import { TestBed, inject, async } from '@angular/core/testing';

import { IsLoadingService } from './is-loading.service';
import { take } from 'rxjs/operators';
import { BehaviorSubject, defer, Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('IsLoadingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [IsLoadingService],
    });
  });

  it('should be created', inject(
    [IsLoadingService],
    (service: IsLoadingService) => {
      expect(service).toBeTruthy();
    },
  ));

  describe('with isLoading$', () => {
    describe('default key', () => {
      it('#isLoading$ simple', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          const value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();
        }),
      ));

      it('#add & #remove', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          service.add();

          let value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          service.add();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          service.remove();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          service.remove();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();
        }),
      ));

      it('#add w/ subscription', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          const subject = new BehaviorSubject(true);

          const subscription = subject.subscribe();

          service.add(subscription);

          let value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          service.add(subscription);

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          subject.complete();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();
        }),
      ));

      it('#add w/ promise', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          const resolvePromise = new Subject();

          const promise = new Promise((resolve, reject) => {
            resolvePromise.subscribe(() => {
              resolve(true);
              resolvePromise.complete();
            });
          });

          service.add(promise);

          let value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          service.add(promise);

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          // resolve promise
          resolvePromise.next(true);

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          // Test adding promise which has already resolved
          service.add(promise);

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();
        }),
      ));

      // it('#isLoading$ observable', async(inject([IsLoadingService], async (service: IsLoadingService) => {
      //   let count=0

      //   service.isLoading$().subscribe(value => {
      //     count++

      //     if (count % 2 === 0) {
      //       expect(value).toBeFalsy()
      //     }
      //     else {
      //       expect(value).toBeTruthy()
      //     }
      //   })

      //   service.add()
      //   service.add()
      //   service.add()
      //   service.remove()
      //   service.remove()
      //   service.remove()

      //   expect(count).toBe(2)
      // })));
    });

    describe('class key', () => {
      it('#isLoading$ simple', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          let value = true;

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();
        }),
      ));

      it('#add & #remove', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          let value = false;

          service.add({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value!).toBeTruthy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value!).toBeFalsy();

          service.add({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value!).toBeTruthy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value!).toBeFalsy();

          service.remove({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value!).toBeTruthy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value!).toBeFalsy();

          service.remove({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value!).toBeFalsy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value!).toBeFalsy();
        }),
      ));

      it('#add w/ subscription', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          let value = false;

          const subject = new BehaviorSubject(true);

          const subscription = subject.subscribe();

          service.add(subscription, { key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          service.add(subscription, { key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          subject.complete();

          expect(subscription.closed).toBeTruthy();

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();
        }),
      ));

      it('#add w/ promise', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          const resolvePromise = new Subject();

          const promise = new Promise((resolve, reject) => {
            resolvePromise.subscribe(() => {
              resolve(true);
              resolvePromise.complete();
            });
          });

          let value = false;

          service.add(promise, { key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          service.add(promise, { key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          // resolve promise
          resolvePromise.next();

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          // Test adding already resolved promise
          service.add(promise, { key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();
        }),
      ));

      // it('#isLoading$ observable', async(inject([IsLoadingService], (service: IsLoadingService) => {
      //   new Promise((resolve, reject) => {
      //     let countKey=0
      //     let countDefault=0

      //     service.isLoading$({key: IsLoadingService}).subscribe(value => {
      //       countKey++

      //       if (countKey % 2 === 0) {
      //         expect(value).toBeFalsy()
      //       }
      //       else {
      //         expect(value).toBeTruthy()
      //       }
      //     })

      //     service.isLoading$().subscribe(() => {
      //       countDefault++
      //     })

      //     service.add({key: IsLoadingService})
      //     service.add({key: IsLoadingService})
      //     service.add({key: IsLoadingService})
      //     service.remove({key: IsLoadingService})
      //     service.remove({key: IsLoadingService})
      //     service.remove({key: IsLoadingService})

      //     expect(countKey).toBe(2)
      //     expect(countDefault).toBe(0)
      //     resolve()
      //   })
      // })));
    });

    describe('multiple keys', () => {
      it('#add & #remove', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          let value = false;

          service.add({ key: [IsLoadingService, 'default'] });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          value = await service
            .isLoading$({ key: 'button' })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          service.add({ key: [IsLoadingService, 'button'] });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          value = await service
            .isLoading$({ key: 'button' })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          service.remove({ key: [IsLoadingService, 'default'] });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          value = await service
            .isLoading$({ key: 'button' })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeTruthy();

          service.remove({ key: [IsLoadingService, 'button'] });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          value = await service
            .isLoading$()
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();

          value = await service
            .isLoading$({ key: 'button' })
            .pipe(take(1))
            .toPromise();

          expect(value).toBeFalsy();
        }),
      ));
    });
  });

  describe('with isLoading', () => {
    describe('default key', () => {
      it('#isLoading$ simple', inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          expect(service.isLoading()).toBeFalsy();
        },
      ));

      it('#add & #remove', inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          service.add();

          expect(service.isLoading()).toBeTruthy();

          service.add();

          expect(service.isLoading()).toBeTruthy();

          service.remove();

          expect(service.isLoading()).toBeTruthy();

          service.remove();

          expect(service.isLoading()).toBeFalsy();
        },
      ));

      it('#add w/ subscription', inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          const subject = new BehaviorSubject(true);

          const subscription = service.add(subject.subscribe());

          expect(service.isLoading()).toBeTruthy();

          service.add(subscription);
          expect(service.isLoading()).toBeTruthy();

          subject.complete();

          expect(service.isLoading()).toBeFalsy();
        },
      ));

      it('#add w/ promise', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          const resolvePromise = new Subject();

          const promise = new Promise((resolve, reject) => {
            resolvePromise.subscribe(() => {
              resolve(true);
              resolvePromise.complete();
            });
          });

          service.add(promise);

          expect(service.isLoading()).toBeTruthy();

          service.add(promise);
          expect(service.isLoading()).toBeTruthy();

          resolvePromise.next();

          await promise;

          expect(service.isLoading()).toBeFalsy();
        }),
      ));
    });

    describe('class key', () => {
      it('#isLoading$ simple', inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          expect(service.isLoading({ key: IsLoadingService })).toBeFalsy();
        },
      ));

      it('#add & #remove', inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          service.add({ key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBeTruthy();
          expect(service.isLoading()).toBeFalsy();

          service.add({ key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBeTruthy();
          expect(service.isLoading()).toBeFalsy();

          service.remove({ key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBeTruthy();
          expect(service.isLoading()).toBeFalsy();

          service.remove({ key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBeFalsy();
          expect(service.isLoading()).toBeFalsy();
        },
      ));

      it('#add w/ subscription', inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          const subject = new BehaviorSubject(true);

          const subscription = subject.subscribe();

          service.add(subscription, { key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBeTruthy();
          expect(service.isLoading()).toBeFalsy();

          service.add(subscription, { key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBeTruthy();
          expect(service.isLoading()).toBeFalsy();

          subject.complete();

          expect(subscription.closed).toBeTruthy();

          expect(service.isLoading({ key: IsLoadingService })).toBeFalsy();
          expect(service.isLoading()).toBeFalsy();
        },
      ));

      it('#add w/ promise', async(
        inject([IsLoadingService], async (service: IsLoadingService) => {
          const resolvePromise = new Subject();

          const promise = new Promise((resolve, reject) => {
            resolvePromise.subscribe(() => {
              resolve(true);
              resolvePromise.complete();
            });
          });

          service.add(promise, { key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBeTruthy();
          expect(service.isLoading()).toBeFalsy();

          service.add(promise, { key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBeTruthy();
          expect(service.isLoading()).toBeFalsy();

          resolvePromise.next();

          await promise;

          expect(service.isLoading({ key: IsLoadingService })).toBeFalsy();
          expect(service.isLoading()).toBeFalsy();
        }),
      ));
    });
  });

  it('garbage collection', async(
    inject([IsLoadingService], async (service: IsLoadingService) => {
      const key = Symbol('key');

      service.add({ key });

      expect(service['loadingKeyIndex'].size).toBe(1);
      expect(service['loadingSubjects'].size).toBe(1);
      expect(service['loadingStacks'].size).toBe(1);

      service.remove({ key });

      expect(service['loadingKeyIndex'].size).toBe(0);
      expect(service['loadingSubjects'].size).toBe(0);
      expect(service['loadingStacks'].size).toBe(0);

      service.add({ key: [IsLoadingService, 'default'] });

      expect(service['loadingKeyIndex'].size).toBe(2);
      expect(service['loadingSubjects'].size).toBe(2);
      expect(service['loadingStacks'].size).toBe(2);

      service.add({ key: [IsLoadingService, 'button'] });

      expect(service['loadingKeyIndex'].size).toBe(3);
      expect(service['loadingSubjects'].size).toBe(3);
      expect(service['loadingStacks'].size).toBe(3);

      service.remove({ key: [IsLoadingService, 'button'] });

      expect(service['loadingKeyIndex'].size).toBe(2);
      expect(service['loadingSubjects'].size).toBe(2);
      expect(service['loadingStacks'].size).toBe(2);

      service.remove({ key: [IsLoadingService, 'default'] });

      expect(service['loadingKeyIndex'].size).toBe(0);
      expect(service['loadingSubjects'].size).toBe(0);
      expect(service['loadingStacks'].size).toBe(0);
    }),
  ));

  /**
   * This test makes sure that calling IsLoadingService#remove()
   * more times than IsLoadingService#add() works properly--even
   * when add() is also called with promises sometimes.
   */
  it('garbage collection with #remove', async(
    inject([IsLoadingService], async (service: IsLoadingService) => {
      const key = Symbol('key');

      let resolve: () => void;

      const promise = new Promise(res => {
        resolve = res;
      });

      service.add(promise, { key });

      expect(service['loadingKeyIndex'].size).toBe(1);
      expect(service['loadingSubjects'].size).toBe(1);
      expect(service['loadingStacks'].size).toBe(1);

      service.remove({ key });

      expect(service['loadingKeyIndex'].size).toBe(1);
      expect(service['loadingSubjects'].size).toBe(1);
      expect(service['loadingStacks'].size).toBe(1);

      service.add({ key: [IsLoadingService, 'default'] });

      expect(service['loadingKeyIndex'].size).toBe(3);
      expect(service['loadingSubjects'].size).toBe(3);
      expect(service['loadingStacks'].size).toBe(3);

      service.remove({ key: [IsLoadingService, 'default', key] });

      expect(service['loadingKeyIndex'].size).toBe(1);
      expect(service['loadingSubjects'].size).toBe(1);
      expect(service['loadingStacks'].size).toBe(1);

      service.remove({ key });

      expect(service['loadingKeyIndex'].size).toBe(1);
      expect(service['loadingSubjects'].size).toBe(1);
      expect(service['loadingStacks'].size).toBe(1);

      resolve!();

      await promise;

      expect(service['loadingKeyIndex'].size).toBe(0);
      expect(service['loadingSubjects'].size).toBe(0);
      expect(service['loadingStacks'].size).toBe(0);
    }),
  ));
});
