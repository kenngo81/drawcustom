import { createContext } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import {
  createDispatchHook,
  createSelectorHook,
  createStoreHook,
  type ReactReduxContextValue,
} from 'react-redux';
import canvasReducer, { createInitialState, type CanvasState } from './canvasSlice';

/**
 * One store per <DrawCustomBoard>. Several boards can live on the same page
 * (e.g. the home board plus an image annotator) without sharing state.
 */
export function createDrawStore(preloaded?: Partial<CanvasState>) {
  return configureStore({
    reducer: { canvas: canvasReducer },
    preloadedState: { canvas: { ...createInitialState(), ...preloaded } },
    // Snapshots for undo contain plain data only; skip the costly dev checks on big boards
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false, immutableCheck: false }),
  });
}

export type DrawStore = ReturnType<typeof createDrawStore>;
export type RootState = ReturnType<DrawStore['getState']>;
export type AppDispatch = DrawStore['dispatch'];

/**
 * Private react-redux context: the host app may use Redux too, and its <Provider>
 * must never be picked up by (or hide) the board's store.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DrawReduxContext = createContext<ReactReduxContextValue<RootState, any> | null>(
  null
);

export const useAppDispatch = createDispatchHook(DrawReduxContext).withTypes<AppDispatch>();
export const useAppSelector = createSelectorHook(DrawReduxContext).withTypes<RootState>();
export const useAppStore = createStoreHook(DrawReduxContext).withTypes<DrawStore>();
