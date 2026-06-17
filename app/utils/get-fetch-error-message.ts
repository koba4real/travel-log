import type { FetchError } from "ofetch";

export default function getFetchErrorMessage(error: FetchError) {
  return error.data?.statusMessage
    || error.data?.message
    || error.statusMessage
    || "Something went wrong. Please try again.";
}
