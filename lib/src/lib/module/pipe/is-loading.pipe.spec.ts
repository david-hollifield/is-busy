import { IsLoadingPipe } from './is-loading.pipe';
import { TestBed } from '@angular/core/testing';
import { IsLoadingPipeModule } from './is-loading.pipe.module';
import { IsLoadingService } from '../../is-loading.service';
import { take } from 'rxjs/operators';

describe('IsLoadingPipe', () => {
  let isLoadingService: IsLoadingService;
  let pipe: IsLoadingPipe;

  async function wait(ms: number) {
    await new Promise(res => setTimeout(res, ms));
  }

  beforeEach(() => {
    const testingModule = TestBed.configureTestingModule({
      imports: [IsLoadingPipeModule],
      declarations: [],
    });

    isLoadingService = testingModule.get(IsLoadingService);
    pipe = new IsLoadingPipe(isLoadingService);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should work when argument is "default"', async () => {
    let result: boolean | undefined;

    isLoadingService.add();

    await wait(50);

    result = await pipe
      .transform('default')
      .pipe(take(1))
      .toPromise();

    expect(result).toBe(true);

    isLoadingService.remove();
    isLoadingService.add({ key: 'button' }); // this should be ignored

    await wait(50);

    result = await pipe
      .transform('default')
      .pipe(take(1))
      .toPromise();

    expect(result).toBe(false);
  });

  it('should work when argument is "button"', async () => {
    let result: boolean | undefined;

    isLoadingService.add({ key: 'button' });

    await wait(50);

    result = await pipe
      .transform('button')
      .pipe(take(1))
      .toPromise();

    expect(result).toBe(true);

    isLoadingService.remove({ key: 'button' });
    isLoadingService.add(); // this should be ignored

    await wait(50);

    result = await pipe
      .transform('button')
      .pipe(take(1))
      .toPromise();

    expect(result).toBe(false);
  });

  it('should work when argument is an object', async () => {
    let result: boolean | undefined;
    const key = {};

    isLoadingService.add({ key });

    await wait(50);

    result = await pipe
      .transform(key)
      .pipe(take(1))
      .toPromise();

    expect(result).toBe(true);

    isLoadingService.remove({ key });
    isLoadingService.add(); // this should be ignored

    await wait(50);

    result = await pipe
      .transform(key)
      .pipe(take(1))
      .toPromise();

    expect(result).toBe(false);
  });
});
