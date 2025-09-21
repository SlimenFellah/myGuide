/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { useNotifications, useGlobalError } from '../store/hooks';
import { removeNotification, clearGlobalError, addNotification } from '../store/slices/appSlice';
import { CheckCircle, AlertCircle, XCircle, X, Info, Clock } from 'lucide-react';

const NotificationSystem = () => {
  const dispatch = useAppDispatch();
  const notifications = useNotifications();
  const error = useGlobalError();
  const [sessionNotification, setSessionNotification] = useState(null);
  
  // Get the most recent notification for display
  const notification = notifications.length > 0 ? notifications[0] : null;

  // Listen for session expiration events
  useEffect(() => {
    const handleSessionExpired = (event) => {
      setSessionNotification({
        type: 'error',
        title: 'Session Expired',
        message: event.detail.message,
        persistent: true
      });
    };

    const handleSessionWarning = (event) => {
      setSessionNotification({
        type: 'warning',
        title: 'Session Warning',
        message: event.detail.message,
        persistent: false
      });
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    window.addEventListener('sessionWarning', handleSessionWarning);

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
      window.removeEventListener('sessionWarning', handleSessionWarning);
    };
  }, []);

  // Auto-clear session warning after 10 seconds
  useEffect(() => {
    if (sessionNotification && !sessionNotification.persistent) {
      const timer = setTimeout(() => {
        setSessionNotification(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [sessionNotification]);

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  // Auto-clear errors after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearGlobalError());
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'session':
        return <Clock className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Session Notification - Highest Priority */}
      {sessionNotification && (
        <div className={`${getNotificationStyles(sessionNotification.type)} border px-4 py-3 rounded-lg shadow-lg max-w-md animate-slide-in ${sessionNotification.persistent ? 'ring-2 ring-red-400' : ''}`}>
          <div className="flex items-start">
            <div className="mr-3 flex-shrink-0">
              {getNotificationIcon(sessionNotification.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium">{sessionNotification.title}</p>
              <p className="text-sm mt-1">{sessionNotification.message}</p>
            </div>
            {!sessionNotification.persistent && (
              <button
                onClick={() => setSessionNotification(null)}
                className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg max-w-md animate-slide-in">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => dispatch(clearGlobalError())}
              className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* General Notification */}
      {notification && (
        <div className={`${getNotificationStyles(notification.type)} border px-4 py-3 rounded-lg shadow-lg max-w-md animate-slide-in`}>
          <div className="flex items-start">
            <div className="mr-3 flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              {notification.title && (
                <p className="font-medium">{notification.title}</p>
              )}
              <p className={`text-sm ${notification.title ? 'mt-1' : ''}`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => dispatch(removeNotification(notification.id))}
              className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;