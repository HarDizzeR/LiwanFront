const clients = new Map(); // Using Map instead of array for better cleanup

/**
 * @function sseConnect
 * @description Establishes SSE connection with client
 */
exports.sseConnect = async (req, res) => {
  try {
    // Validate employee data exists
    if (!req.employee || !req.employee._id) {
      console.error('[SSE] No employee data in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { _id, role, department } = req.employee;

    console.log(`[SSE] Connection attempt - ID: ${_id}, Role: ${role}, Dept: ${department}`);

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': 'http://127.0.0.1:3000',
      'Access-Control-Allow-Credentials': 'true'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ event: 'connected', message: 'Connection established' })}\n\n`);

    // Store client connection
    const clientId = `${_id}-${Date.now()}`;
    const clientData = { 
      res, 
      employeeID: _id, 
      role, 
      departmentId: department,
      connectedAt: new Date()
    };
    
    clients.set(clientId, clientData);
    console.log(`[SSE] Client connected - Total clients: ${clients.size}`);

    // Handle client disconnect
    req.on('close', () => {
      clients.delete(clientId);
      console.log(`[SSE] Client disconnected - Total clients: ${clients.size}`);
    });

  } catch (error) {
    console.error('[SSE] Connection error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @function notifyClients
 * @description Sends notifications to connected clients
 */
exports.notifyClients = (event, ticketData) => {
  try {
    if (!event || !ticketData) {
      console.error('[SSE] Invalid notification data:', { event, ticketData });
      return;
    }

    console.log(`[SSE] Sending ${event} notification to ${clients.size} clients`);

    for (const [clientId, client] of clients.entries()) {
      try {
        const { res, employeeID, role, departmentId } = client;

        // Check if client should receive notification
        let shouldNotify = false;

        switch (role) {
          case 'employee':
            shouldNotify = ticketData.createdBy?.toString() === employeeID?.toString();
            break;
          case 'manager':
            shouldNotify = ticketData.assignedTo?.toString() === departmentId?.toString();
            break;
          case 'admin':
            shouldNotify = true;
            break;
        }

        if (shouldNotify) {
          const message = JSON.stringify({ event, data: ticketData });
          res.write(`data: ${message}\n\n`);
          console.log(`[SSE] Notification sent to ${role} (${clientId})`);
        }

      } catch (error) {
        console.error(`[SSE] Error sending to client ${clientId}:`, error);
        clients.delete(clientId); // Remove failed connection
      }
    }
  } catch (error) {
    console.error('[SSE] Notification error:', error);
  }
};

// Add a health check endpoint
exports.getConnectedClients = () => {
  console.log('[SSE] Getting connected clients');
  return {
    totalClients: clients.size,
    clients: Array.from(clients.entries()).map(([id, client]) => ({
      id,
      role: client.role,
      connectedAt: client.connectedAt
    }))
  };
};