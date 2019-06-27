import { InjectionToken } from '@angular/core';

export const SW_IS_LOADING_DIRECTIVE_CONFIG = new InjectionToken(
  'SW_IS_LOADING_DIRECTIVE_CONFIG',
);

export interface ISWIsLoadingDirectiveConfig {
  // disable element while loading
  disableEl?: boolean;
  // the class used to indicate loading
  loadingClass?: string;
  // should a spinner element be added to the dom
  addSpinnerEl?: boolean;
}
