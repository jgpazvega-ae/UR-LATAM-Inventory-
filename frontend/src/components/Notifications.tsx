import { useNotification } from '../contexts/NotificationContext';

const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

export default function Notifications() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 ${colors[notification.type]}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{icons[notification.type]}</span>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-lg hover:opacity-70 transition"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
