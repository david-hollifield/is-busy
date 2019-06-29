/*
 * Public API Surface of is-loading
 */

/**
 * Important!
 * The IsLoadingDirectiveModule files must be exported
 * individually without using an `index.ts` file in the
 * `./lib/directive` folder. Otherwise there's some sort of
 * bug with `ng-packagr` or `angular` which prevents the
 * `service-work-is-loading.metadata.json` from being
 * properly built.
 */

export * from './lib/is-loading.service';
export * from './lib/directive/is-loading.directive.module';
export * from './lib/directive/is-loading.directive';
export * from './lib/directive/is-loading.directive.config';
