/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_fetchShorts from "../actions/fetchShorts.js";
import type * as actions_generateOutline from "../actions/generateOutline.js";
import type * as mutations_appendFeedItems from "../mutations/appendFeedItems.js";
import type * as mutations_appendOutlineItems from "../mutations/appendOutlineItems.js";
import type * as mutations_createPrompt from "../mutations/createPrompt.js";
import type * as mutations_deletePrompt from "../mutations/deletePrompt.js";
import type * as mutations_updatePromptProgress from "../mutations/updatePromptProgress.js";
import type * as queries_getPrompt from "../queries/getPrompt.js";
import type * as queries_listFeedItems from "../queries/listFeedItems.js";
import type * as queries_listPrompts from "../queries/listPrompts.js";
import type * as storage from "../storage.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/fetchShorts": typeof actions_fetchShorts;
  "actions/generateOutline": typeof actions_generateOutline;
  "mutations/appendFeedItems": typeof mutations_appendFeedItems;
  "mutations/appendOutlineItems": typeof mutations_appendOutlineItems;
  "mutations/createPrompt": typeof mutations_createPrompt;
  "mutations/deletePrompt": typeof mutations_deletePrompt;
  "mutations/updatePromptProgress": typeof mutations_updatePromptProgress;
  "queries/getPrompt": typeof queries_getPrompt;
  "queries/listFeedItems": typeof queries_listFeedItems;
  "queries/listPrompts": typeof queries_listPrompts;
  storage: typeof storage;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
