interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string; select_by: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: "signin" | "signup" | "use";
    itp_support?: boolean;
    ux_mode?: "popup" | "redirect";
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
      width?: number;
      locale?: string;
    },
  ) => void;
  prompt: (
    callback?: (notification: {
      isDisplayMoment: () => boolean;
      isDisplayed: () => boolean;
      isNotDisplayed: () => boolean;
      getNotDisplayedReason: () => string;
      isSkippedMoment: () => boolean;
      getSkippedReason: () => string;
      isDismissedMoment: () => boolean;
      getDismissedReason: () => string;
    }) => void,
  ) => void;
  revoke: (
    hint: string,
    callback: (done: { successful: boolean; error?: string }) => void,
  ) => void;
  disableAutoSelect: () => void;
}

interface Google {
  accounts: {
    id: GoogleAccountsId;
  };
}

interface Window {
  google?: Google;
}
