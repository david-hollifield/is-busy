import { InjectionToken } from '@angular/core';

export const SW_IS_LOADING_DIRECTIVE_CONFIG = new InjectionToken(
  'SW_IS_LOADING_DIRECTIVE_CONFIG',
);

/**
 * Config object for IsLoadingDirective
 * 
 * @param disableEl disable element while loading?
 * @param loadingClass the class used to indicate loading
 * @param addSpinnerEl should a spinner element be added to the dom?
 */
export interface ISWIsLoadingDirectiveConfig {
  // disable element while loading
  disableEl?: boolean;
  // the class used to indicate loading
  loadingClass?: string;
  // should a spinner element be added to the dom
  addSpinnerEl?: boolean;
}
