/*
 * Public API Surface of scroll-position
 */
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

export { ScrollPositionService } from "./scroll-position/scroll-position.service";
export {
  SW_SCROLL_POSITION_CONFIG,
  IScrollPositionServiceConfig,
} from "./scroll-position/scroll-position.config";

export { ScrollPositionDirectiveModule } from "./scroll-position/module/directive/scroll-position.directive.module";
export { ScrollPositionDirective } from "./scroll-position/module/directive/scroll-position.directive";
