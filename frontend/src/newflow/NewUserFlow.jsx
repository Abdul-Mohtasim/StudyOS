import { useEffect, useRef } from "react";
import { mountNewUserFlow } from "./engine";

// Thin React wrapper around the imperative new-user flow (app only).
export default function NewUserFlow({ onBack, register, google, invite, contacts, onFinish, guest, startAt }) {
  const hostRef = useRef(null);
  const cb = useRef({});
  cb.current = { onBack, register, google, invite, contacts, onFinish, guest };
  useEffect(() => {
    const api = mountNewUserFlow(hostRef.current, {
      onBack: () => cb.current.onBack?.(),
      register: (d) => cb.current.register(d),
      google: () => cb.current.google(),
      invite: () => cb.current.invite?.(),
      contacts: () => cb.current.contacts?.(),
      onFinish: (d) => cb.current.onFinish?.(d),
      guest: cb.current.guest ? (d) => cb.current.guest?.(d) : undefined,
      startAt,
    });
    return () => api.destroy();
  }, []);
  return <div ref={hostRef} />;
}
