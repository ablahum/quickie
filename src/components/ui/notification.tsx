import { NotificationType } from "@/types";
import { useEffect } from "react";

export type NotificationProps = {
  message: string;
  type?: NotificationType.SUCCESS | NotificationType.FAILED;
  onClose: () => void;
};

export const Notification = ({
  message,
  type = NotificationType.SUCCESS,
  onClose,
}: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-5 right-5 z-[9999] rounded px-4 py-3 text-white shadow-lg transition-all ${type === NotificationType.SUCCESS ? "bg-green-600" : "bg-red-600"}`}
    >
      {message}
    </div>
  );
};
