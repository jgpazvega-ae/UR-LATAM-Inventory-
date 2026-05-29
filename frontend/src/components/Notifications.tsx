import { useNotification } from '../contexts/NotificationContext';

const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const colorClasses = {
  success: {
    bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
    border: 'border-green-200',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-900',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50',
    border: 'border-red-200',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-900',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-900',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-900',
  },
};

export default function Notifications() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-6 right-6 space-y-3 z-50 max-w-sm pointer-events-none">
      {notifications.map((notification) => {
        const colors = colorClasses[notification.type];
        return (
          <div
            key={notification.id}
            className={`${colors.bg} border ${colors.border} rounded-2xl p-4 flex items-start gap-3 shadow-premium-lg pointer-events-auto animate-fadeIn transition-all duration-500`}
          >
            <div className={`${colors.icon} rounded-lg p-2 flex items-center justify-center flex-shrink-0`}>
              <span className="text-lg">{icons[notification.type]}</span>
            </div>
            <div className="flex-1">
              {notification.title && (
                <p className={`text-sm font-bold ${colors.text}`}>{notification.title}</p>
              )}
              <p className={`text-sm font-medium ${colors.text} ${notification.title ? 'mt-1' : ''}`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className={`text-xl hover:opacity-70 transition flex-shrink-0 ${colors.text}`}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
