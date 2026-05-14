"use client";

import React from "react";

/**
 * Detects an `id_token` in the URL hash fragment (from the Google OAuth implicit
 * flow popup redirect) and forwards it to the opener window via postMessage,
 * then closes the popup.
 *
 * If there is no opener (direct navigation), it cleans the hash from the URL.
 */
export default function GoogleAuthCallback() {
    React.useEffect(() => {
        const hash = window.location.hash;
        if (!hash || !hash.includes("id_token")) return;

        const params = new URLSearchParams(hash.substring(1));
        const idToken = params.get("id_token");
        if (!idToken) return;

        if (window.opener) {
            // We're inside the popup — send the token back to the opener
            window.opener.postMessage(
                { type: "GOOGLE_ID_TOKEN", idToken },
                window.location.origin,
            );
            window.close();
        } else {
            // Direct navigation — clean the URL (token will be picked up below
            // by page-level logic if needed)
            window.history.replaceState(null, "", window.location.pathname);
        }
    }, []);

    return null;
}
