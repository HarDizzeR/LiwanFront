// hooks/useSSE.js
import { useState, useEffect } from 'react';

export const useSSE = (onTicketCreated, onTicketUpdated) => {
  const [sseStatus, setSseStatus] = useState('Connecting...');
  const [sseError, setSseError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let eventSource;
    let retryTimeout;

    const connectSSE = async () => {
      try {
        // Get access token
        const accessToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken"))
          ?.split("=")[1];

          console.log('Access Token:', accessToken);
        
        if (!accessToken) {
          setSseError('Authentication required');
          setSseStatus('Error');
          return;
        }

        // Close existing connection
        if (eventSource) {
          eventSource.close();
        }

        // Create new connection
        eventSource = new EventSource('https://liwan-back.vercel.app/api/v1/sse/connect', {
          withCredentials: true
        });

        // Connection opened
        eventSource.onopen = () => {
          console.log('[SSE] Connection opened');
          setSseStatus('Connected');
          setSseError(null);
          setRetryCount(0);
        };

        // Handle messages
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[SSE] Message received:', data);

            if (data.event === 'connected') {
              console.log('[SSE] Successfully connected');
              return;
            }

            if (data.event === 'ticketCreated' && onTicketCreated) {
              onTicketCreated(data.data);
            } else if (data.event === 'ticketUpdated' && onTicketUpdated) {
              onTicketUpdated(data.data);
            }
          } catch (error) {
            console.error('[SSE] Message processing error:', error);
          }
        };

        // Handle errors
        eventSource.onerror = (error) => {
          console.error('[SSE] Connection error:', error);
          setSseStatus('Disconnected');
          
          if (retryCount < MAX_RETRIES) {
            const nextRetry = retryCount + 1;
            setSseError(`Connection lost. Retry ${nextRetry}/${MAX_RETRIES}...`);
            eventSource.close();
            
            retryTimeout = setTimeout(() => {
              setRetryCount(nextRetry);
              connectSSE();
            }, 5000);
          } else {
            setSseError('Max retries reached. Please refresh.');
            eventSource.close();
          }
        };

      } catch (error) {
        console.error('[SSE] Setup error:', error);
        setSseError('Connection failed. Please refresh.');
        setSseStatus('Error');
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [onTicketCreated, onTicketUpdated, retryCount]);

  return {
    sseStatus,
    sseError,
    isConnected: sseStatus === 'Connected'
  };
};