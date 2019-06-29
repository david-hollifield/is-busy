/*
 * Public API Surface of is-loading
 *
 * Important!
 * The files must be exported
 * individually without using an `index.ts` file (i.e.
 * `./lib/module/directive`). Otherwise there's some sort of
 * bug with `ng-packagr` or `angular` which prevents the
 * `service-work-is-loading.metadata.json` from being
 * properly built.
 */

export * from './lib/is-loading.service';

export * from './lib/module/is-loading.module';

export * from './lib/module/directive/is-loading.directive.module';
export * from './lib/module/directive/is-loading.directive';
export * from './lib/module/directive/is-loading.directive.config';

export * from './lib/module/pipe/is-loading.pipe.module';
export * from './lib/module/pipe/is-loading.pipe';
