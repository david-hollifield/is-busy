import { TestBed, inject } from "@angular/core/testing";

import { IsLoadingService } from "./is-loading.service";
import { BehaviorSubject, Subject, of } from "rxjs";
import { skip, take, takeUntil, toArray } from "rxjs/operators";

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

describe("IsLoadingService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [IsLoadingService],
    });
  });

  it("should be created", inject(
    [IsLoadingService],
    (service: IsLoadingService) => {
      expect(service).toBeInstanceOf(IsLoadingService);
    }
  ));

  describe("with isLoading$", () => {
    describe("default key", () => {
      it("#isLoading$ simple", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          const value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);
        }
      ));

      it("#add & #remove", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          service.add();

          let value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          service.add();

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          service.remove();

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          service.remove();

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);
        }
      ));

      it("#add w/ subscription", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          const subject = new BehaviorSubject(true);

          const subscription = subject.subscribe();

          service.add(subscription);

          let value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          service.add(subscription);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          subject.complete();

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);
        }
      ));

      it("#add w/ promise", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          let resolvePromise!: () => void;

          const promise = new Promise((res) => {
            resolvePromise = res;
          });

          service.add(promise);

          let value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          service.add(promise);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          const pending = service
            .isLoading$()
            .pipe(skip(1), take(1))
            .toPromise();

          // resolve promise
          resolvePromise();

          value = await pending;

          expect(value).toBe(false);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);

          const end = new Subject();

          const pendingEvents = service
            .isLoading$()
            .pipe(takeUntil(end), toArray())
            .toPromise();

          // Test adding promise which has already resolved
          service.add(promise);

          await wait(0);

          end.next();
          end.complete();

          const [e1, e2, e3, e4] = await pendingEvents;

          expect(e1).toBe(false);
          expect(e2).toBe(true);
          expect(e3).toBe(false);
          expect(e4).toBe(undefined);
        }
      ));

      // test for https://gitlab.com/service-work/is-loading/issues/3
      it("add syncronous observable", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          service.add(of([]));

          expect(await service.isLoading$().pipe(take(1)).toPromise()).toBe(
            false
          );
        }
      ));
    });

    describe("class key", () => {
      it("#isLoading$ simple", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          let value = true;

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);
        }
      ));

      it("#add & #remove", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          let value = false;

          service.add({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value!).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value!).toBe(false);

          service.add({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value!).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value!).toBe(false);

          service.remove({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value!).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value!).toBe(false);

          service.remove({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value!).toBe(false);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value!).toBe(false);
        }
      ));

      it("#add w/ subscription", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          let value = false;

          const subject = new BehaviorSubject(true);

          const subscription = subject.subscribe();

          service.add(subscription, { key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);

          service.add(subscription, { key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);

          subject.complete();

          expect(subscription.closed).toBe(true);

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);
        }
      ));

      it("#add w/ promise", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          let resolvePromise!: () => void;

          const promise = new Promise((res) => {
            resolvePromise = res;
          });

          let value = false;

          service.add(promise, { key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);

          service.add(promise, { key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);

          const pending = service
            .isLoading$({ key: IsLoadingService })
            .pipe(skip(1), take(1))
            .toPromise();

          // resolve promise
          resolvePromise();

          value = await pending;

          expect(value).toBe(false);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);

          // Test adding already resolved promise
          service.add(promise, { key: IsLoadingService });

          await wait(0);

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);
        }
      ));

      // it('#isLoading$ observable', async(inject([IsLoadingService], (service: IsLoadingService) => {
      //   new Promise((resolve, reject) => {
      //     let countKey=0
      //     let countDefault=0

      //     service.isLoading$({key: IsLoadingService}).subscribe(value => {
      //       countKey++

      //       if (countKey % 2 === 0) {
      //         expect(value).toBe(false)
      //       }
      //       else {
      //         expect(value).toBe(true)
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

    describe("multiple keys", () => {
      it("#add & #remove", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          let value = false;

          service.add({ key: [IsLoadingService, "default"] });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          value = await service
            .isLoading$({ key: "button" })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);

          service.add({ key: [IsLoadingService, "button"] });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          value = await service
            .isLoading$({ key: "button" })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          service.remove({ key: [IsLoadingService, "default"] });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);

          value = await service
            .isLoading$({ key: "button" })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          service.remove({ key: [IsLoadingService, "button"] });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);

          value = await service
            .isLoading$({ key: "button" })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);
        }
      ));

      it("isLoading$()", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          let value = false;

          service.add({ key: [IsLoadingService, "default"] });

          value = await service
            .isLoading$({ key: [IsLoadingService, "button"] })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          service.remove({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: [IsLoadingService, "button"] })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);

          value = await service
            .isLoading$({ key: "button" })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);

          service.remove();
          service.add({ key: [IsLoadingService, "button"] });

          value = await service
            .isLoading$({ key: [IsLoadingService, "button"] })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          value = await service
            .isLoading$({ key: "button" })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          service.remove({ key: "button" });

          value = await service
            .isLoading$({ key: [IsLoadingService, "button"] })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          service.remove({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: [IsLoadingService, "button"] })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);
        }
      ));
    });

    describe("unique", () => {
      it("#add & #remove", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          let value = false;

          service.add({ unique: IsLoadingService });

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          value = await service
            .isLoading$({ key: "button" })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);

          service.add({ key: IsLoadingService, unique: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          service.add({ unique: IsLoadingService });

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(true);

          service.remove();

          value = await service.isLoading$().pipe(take(1)).toPromise();

          expect(value).toBe(false);

          service.remove({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);

          service.add({ key: IsLoadingService, unique: IsLoadingService });
          service.add({ key: IsLoadingService, unique: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(true);

          service.remove({ key: IsLoadingService });

          value = await service
            .isLoading$({ key: IsLoadingService })
            .pipe(take(1))
            .toPromise();

          expect(value).toBe(false);
        }
      ));
    });
  });

  describe("with isLoading", () => {
    describe("default key", () => {
      it("#isLoading$ simple", inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          expect(service.isLoading()).toBe(false);
        }
      ));

      it("#add & #remove", inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          service.add();

          expect(service.isLoading()).toBe(true);

          service.add();

          expect(service.isLoading()).toBe(true);

          service.remove();

          expect(service.isLoading()).toBe(true);

          service.remove();

          expect(service.isLoading()).toBe(false);
        }
      ));

      it("#add w/ subscription", inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          const subject = new BehaviorSubject(true);

          const subscription = service.add(subject.subscribe());

          expect(service.isLoading()).toBe(true);

          service.add(subscription);
          expect(service.isLoading()).toBe(true);

          subject.complete();

          expect(service.isLoading()).toBe(false);
        }
      ));

      it("#add w/ promise", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          const resolvePromise = new Subject();

          const promise = new Promise((resolve, reject) => {
            resolvePromise.subscribe(() => {
              resolve(true);
              resolvePromise.complete();
            });
          });

          service.add(promise);

          expect(service.isLoading()).toBe(true);

          service.add(promise);
          expect(service.isLoading()).toBe(true);

          resolvePromise.next();

          await promise;

          expect(service.isLoading()).toBe(false);
        }
      ));

      // test for https://gitlab.com/service-work/is-loading/issues/3
      it("add syncronous observable", inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          service.add(of([]));

          expect(service.isLoading()).toBe(false);
        }
      ));
    });

    describe("class key", () => {
      it("#isLoading$ simple", inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          expect(service.isLoading({ key: IsLoadingService })).toBe(false);
        }
      ));

      it("#add & #remove", inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          service.add({ key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBe(true);
          expect(service.isLoading()).toBe(false);

          service.add({ key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBe(true);
          expect(service.isLoading()).toBe(false);

          service.remove({ key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBe(true);
          expect(service.isLoading()).toBe(false);

          service.remove({ key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBe(false);
          expect(service.isLoading()).toBe(false);
        }
      ));

      it("#add w/ subscription", inject(
        [IsLoadingService],
        (service: IsLoadingService) => {
          const subject = new BehaviorSubject(true);

          const subscription = subject.subscribe();

          service.add(subscription, { key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBe(true);
          expect(service.isLoading()).toBe(false);

          service.add(subscription, { key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBe(true);
          expect(service.isLoading()).toBe(false);

          subject.complete();

          expect(subscription.closed).toBe(true);

          expect(service.isLoading({ key: IsLoadingService })).toBe(false);
          expect(service.isLoading()).toBe(false);
        }
      ));

      it("#add w/ promise", inject(
        [IsLoadingService],
        async (service: IsLoadingService) => {
          const resolvePromise = new Subject();

          const promise = new Promise((resolve, reject) => {
            resolvePromise.subscribe(() => {
              resolve(true);
              resolvePromise.complete();
            });
          });

          service.add(promise, { key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBe(true);
          expect(service.isLoading()).toBe(false);

          service.add(promise, { key: IsLoadingService });

          expect(service.isLoading({ key: IsLoadingService })).toBe(true);
          expect(service.isLoading()).toBe(false);

          resolvePromise.next();

          await promise;

          expect(service.isLoading({ key: IsLoadingService })).toBe(false);
          expect(service.isLoading()).toBe(false);
        }
      ));
    });
  });

  it("garbage collection", inject(
    [IsLoadingService],
    async (service: IsLoadingService) => {
      const key = Symbol("key");

      service.add({ key });

      expect(service["loadingKeyIndex"].size).toBe(1);
      expect(service["loadingSubjects"].size).toBe(1);
      expect(service["loadingStacks"].size).toBe(1);

      service.remove({ key });

      expect(service["loadingKeyIndex"].size).toBe(0);
      expect(service["loadingSubjects"].size).toBe(0);
      expect(service["loadingStacks"].size).toBe(0);

      service.add({ key: [IsLoadingService, "default"] });

      expect(service["loadingKeyIndex"].size).toBe(2);
      expect(service["loadingSubjects"].size).toBe(2);
      expect(service["loadingStacks"].size).toBe(2);

      service.add({ key: [IsLoadingService, "button"] });

      expect(service["loadingKeyIndex"].size).toBe(3);
      expect(service["loadingSubjects"].size).toBe(3);
      expect(service["loadingStacks"].size).toBe(3);

      service.remove({ key: [IsLoadingService, "button"] });

      expect(service["loadingKeyIndex"].size).toBe(2);
      expect(service["loadingSubjects"].size).toBe(2);
      expect(service["loadingStacks"].size).toBe(2);

      service.remove({ key: [IsLoadingService, "default"] });

      expect(service["loadingKeyIndex"].size).toBe(0);
      expect(service["loadingSubjects"].size).toBe(0);
      expect(service["loadingStacks"].size).toBe(0);
    }
  ));

  /**
   * This test makes sure that calling IsLoadingService#remove()
   * more times than IsLoadingService#add() works properly--even
   * when add() is also called with promises sometimes.
   */
  it("garbage collection with #remove", inject(
    [IsLoadingService],
    async (service: IsLoadingService) => {
      const key = Symbol("key");

      let resolve: () => void;

      const promise = new Promise((res) => {
        resolve = res;
      });

      service.add(promise, { key });

      expect(service["loadingKeyIndex"].size).toBe(1);
      expect(service["loadingSubjects"].size).toBe(1);
      expect(service["loadingStacks"].size).toBe(1);

      service.remove({ key });

      expect(service["loadingKeyIndex"].size).toBe(1);
      expect(service["loadingSubjects"].size).toBe(1);
      expect(service["loadingStacks"].size).toBe(1);

      service.add({ key: [IsLoadingService, "default"] });

      expect(service["loadingKeyIndex"].size).toBe(3);
      expect(service["loadingSubjects"].size).toBe(3);
      expect(service["loadingStacks"].size).toBe(3);

      service.remove({ key: [IsLoadingService, "default", key] });

      expect(service["loadingKeyIndex"].size).toBe(1);
      expect(service["loadingSubjects"].size).toBe(1);
      expect(service["loadingStacks"].size).toBe(1);

      service.remove({ key });

      expect(service["loadingKeyIndex"].size).toBe(1);
      expect(service["loadingSubjects"].size).toBe(1);
      expect(service["loadingStacks"].size).toBe(1);

      resolve!();

      await promise;

      expect(service["loadingKeyIndex"].size).toBe(0);
      expect(service["loadingSubjects"].size).toBe(0);
      expect(service["loadingStacks"].size).toBe(0);
    }
  ));
});
