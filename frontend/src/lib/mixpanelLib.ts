import { GetUserData } from "@/services/user";
import mixpanel, { Mixpanel } from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let mixpanelInstance: Mixpanel | null = null;

let isInitialized = false;

const initMixpanel = async () => {
  if (typeof window !== "undefined" && MIXPANEL_TOKEN && !isInitialized) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === "development",
    });

    const user = await GetUserData();

    if (user.data.data) {
      mixpanel.identify(user.data.data.email);

      mixpanel.people.set({
        $name: `${user.data.data.first_name} ${user.data.data.last_name}`,
        $email: user.data.data.email,
      });
    }

    mixpanelInstance = mixpanel;
    isInitialized = true;
  } else if (!MIXPANEL_TOKEN) {
    console.warn("Mixpanel token is missing; tracking will be disabled.");
  }
};

const trackEvent = async (
  eventName: string,
  eventProps = {}
): Promise<void> => {
  if (!isInitialized) {
    initMixpanel();
  }
  if (mixpanelInstance) {
    mixpanelInstance.track(eventName, eventProps);
  } else {
    console.warn(
      `Event "${eventName}" not tracked because Mixpanel is not initialized.`
    );
  }
};

// Initialize Mixpanel on the client at import
if (typeof window !== "undefined") {
  initMixpanel();
}

export { trackEvent };
