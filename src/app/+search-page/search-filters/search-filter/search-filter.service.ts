import { combineLatest as observableCombineLatest, Observable } from 'rxjs';
import { Injectable, InjectionToken } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SearchFiltersState, SearchFilterState } from './search-filter.reducer';
import { createSelector, MemoizedSelector, select, Store } from '@ngrx/store';
import {
  SearchFilterCollapseAction,
  SearchFilterDecrementPageAction,
  SearchFilterExpandAction,
  SearchFilterIncrementPageAction,
  SearchFilterInitializeAction,
  SearchFilterResetPageAction,
  SearchFilterToggleAction
} from './search-filter.actions';
import { hasValue, isNotEmpty, } from '../../../shared/empty.util';
import { SearchFilterConfig } from '../../search-service/search-filter-config.model';
import { RouteService } from '../../../shared/services/route.service';
import { Params } from '@angular/router';
import { SearchOptions } from '../../search-options.model';
// const spy = create();
const filterStateSelector = (state: SearchFiltersState) => state.searchFilter;

export const FILTER_CONFIG: InjectionToken<SearchFilterConfig> = new InjectionToken<SearchFilterConfig>('filterConfig');

/**
 * Service that performs all actions that have to do with search filters and facets
 */
@Injectable()
export class SearchFilterService {

  constructor(private store: Store<SearchFiltersState>,
              private routeService: RouteService
  ) {
  }

  /**
   * Checks if a given filter is active with a given value
   * @param {string} paramName The parameter name of the filter's configuration for which to search
   * @param {string} filterValue The value for which to search
   * @returns {Observable<boolean>} Emit true when the filter is active with the given value
   */
  isFilterActiveWithValue(paramName: string, filterValue: string): Observable<boolean> {
    return this.routeService.hasQueryParamWithValue(paramName, filterValue);
  }

  /**
   * Checks if a given filter is active with any value
   * @param {string} paramName The parameter name of the filter's configuration for which to search
   * @returns {Observable<boolean>} Emit true when the filter is active with any value
   */
  isFilterActive(paramName: string): Observable<boolean> {
    return this.routeService.hasQueryParam(paramName);
  }

  /**
   * Requests the active filter values set for a given filter
   * @param {SearchFilterConfig} filterConfig The configuration for which the filters are active
   * @returns {Observable<string[]>} Emits the active filters for the given filter configuration
   */
  getSelectedValuesForFilter(filterConfig: SearchFilterConfig): Observable<string[]> {
    const values$ = this.routeService.getQueryParameterValues(filterConfig.paramName);
    const prefixValues$ = this.routeService.getQueryParamsWithPrefix(filterConfig.paramName + '.').pipe(
      map((params: Params) => [].concat(...Object.values(params))),
    );

    return observableCombineLatest(values$, prefixValues$).pipe(
      map(([values, prefixValues]) => {
          if (isNotEmpty(values)) {
            return values;
          }
          return prefixValues;
        }
      )
    )
  }

  /**
   * Checks if the state of a given filter is currently collapsed or not
   * @param {string} filterName The filtername for which the collapsed state is checked
   * @returns {Observable<boolean>} Emits the current collapsed state of the given filter, if it's unavailable, return false
   */
  isCollapsed(filterName: string): Observable<boolean> {
    return this.store.pipe(
      select(filterByNameSelector(filterName)),
      map((object: SearchFilterState) => {
        if (object) {
          return object.filterCollapsed;
        } else {
          return false;
        }
      }),
      distinctUntilChanged()
    );
  }

  /**
   * Request the current page of a given filter
   * @param {string} filterName The filter name for which the page state is checked
   * @returns {Observable<boolean>} Emits the current page state of the given filter, if it's unavailable, return 1
   */
  getPage(filterName: string): Observable<number> {
    return this.store.pipe(
      select(filterByNameSelector(filterName)),
      map((object: SearchFilterState) => {
        if (object) {
          return object.page;
        } else {
          return 1;
        }
      }),
      distinctUntilChanged());
  }

  /**
   * Dispatches a collapse action to the store for a given filter
   * @param {string} filterName The filter for which the action is dispatched
   */
  public collapse(filterName: string): void {
    this.store.dispatch(new SearchFilterCollapseAction(filterName));
  }

  /**
   * Dispatches an expand action to the store for a given filter
   * @param {string} filterName The filter for which the action is dispatched
   */
  public expand(filterName: string): void {
    this.store.dispatch(new SearchFilterExpandAction(filterName));
  }

  /**
   * Dispatches a toggle action to the store for a given filter
   * @param {string} filterName The filter for which the action is dispatched
   */
  public toggle(filterName: string): void {
    this.store.dispatch(new SearchFilterToggleAction(filterName));
  }

  /**
   * Dispatches an initialize action to the store for a given filter
   * @param {SearchFilterConfig} filter The filter for which the action is dispatched
   */
  public initializeFilter(filter: SearchFilterConfig): void {
    this.store.dispatch(new SearchFilterInitializeAction(filter));
  }

  /**
   * Dispatches a decrement action to the store for a given filter
   * @param {string} filterName The filter for which the action is dispatched
   */
  public decrementPage(filterName: string): void {
    this.store.dispatch(new SearchFilterDecrementPageAction(filterName));
  }

  /**
   * Dispatches an increment page action to the store for a given filter
   * @param {string} filterName The filter for which the action is dispatched
   */
  public incrementPage(filterName: string): void {
    this.store.dispatch(new SearchFilterIncrementPageAction(filterName));
  }

  /**
   * Dispatches a reset page action to the store for a given filter
   * @param {string} filterName The filter for which the action is dispatched
   */
  public resetPage(filterName: string): void {
    this.store.dispatch(new SearchFilterResetPageAction(filterName));
  }
}

function filterByNameSelector(name: string): MemoizedSelector<SearchFiltersState, SearchFilterState> {
  return keySelector<SearchFilterState>(name);
}

export function keySelector<T>(key: string): MemoizedSelector<SearchFiltersState, T> {
  return createSelector(filterStateSelector, (state: SearchFilterState) => {
    if (hasValue(state)) {
      return state[key];
    } else {
      return undefined;
    }
  });
}
