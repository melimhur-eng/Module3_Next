"use client";

import { useEffect, useReducer } from "react";

// data, loading and error always change together, so one reducer replaces
// three separate useState calls. Each action describes a whole transition,
// which makes impossible mixes (loading AND error at once) impossible.
function fetchReducer(state, action) {
  switch (action.type) {
    case "start":
      return { data: state.data, loading: true, error: null };
    case "success":
      return { data: action.data, loading: false, error: null };
    case "failure":
      return { data: null, loading: false, error: action.error };
    default:
      throw new Error("Unknown action: " + action.type);
  }
}

export function useFetch(url) {
  const [state, dispatch] = useReducer(fetchReducer, {
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      dispatch({ type: "start" });
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("bad status");
        dispatch({ type: "success", data: await res.json() });
      } catch (e) {
        if (e.name === "AbortError") return;
        dispatch({
          type: "failure",
          error: "Could not load the menu. Please check your connection and try again.",
        });
      }
    }

    load();
    // a new url (or unmounting) cancels the request still in flight
    return () => controller.abort();
  }, [url]);

  return state;
}
