const clients = [];


/**
 * @function sseConnect
 * @description Establishes an SSE connection with the client and maintains it open. Adds the client to a list of connected clients for real-time notifications.
 * @param {Object} req - The request object, which contains employee details (_id, role, and department).
 * @param {Object} res - The response object, which is kept open to send SSE updates.
 * @returns {void} Sets response headers to maintain an SSE connection, writes initial connection message, and adds the client to the clients array.
 * @event close - Removes the client from the `clients` array when the connection is closed.
 */


exports.sseConnect = (req, res) => {
  const { _id, role, department } = req.employee;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "https://liwan.mavoid.com");

  res.write(`data: Connection established for employee ID: ${_id}\n\n`);
  
  clients.push({ res, employeeID: _id, role, departmentId: department });

  req.on("close", () => {
    const index = clients.findIndex(client => client.res === res);
    if (index !== -1) clients.splice(index, 1);
  });
};


/**
 * @function notifyClients
 * @description Sends an SSE notification to connected clients based on their role and association with the ticket data.
 * @param {string} event - The event type to notify clients about (e.g., "ticketCreated", "ticketUpdated").
 * @param {Object} ticketData - The data about the ticket, which includes fields like `createdBy` and `assignedTo`.
 * @returns {void} Loops through connected clients, checking their role and department, and sends relevant notifications based on ticketData.
 * - Sends data to employees only if they created the ticket (`createdBy` matches employeeID).
 * - Sends data to managers only if the ticket is assigned to their department.
 * - Sends data to admins without restrictions.
 */


exports.notifyClients = (event, ticketData) => {
  clients.forEach(({ res, employeeID, role, departmentId }) => {
    if (role === "employee" && ticketData.createdBy.toString() === employeeID.toString()) {
      res.write(`data: ${JSON.stringify({ event, data: ticketData })}\n\n`);
    }
    else if (role === "manager" && ticketData.assignedTo.toString() === departmentId.toString()) {
      res.write(`data: ${JSON.stringify({ event, data: ticketData })}\n\n`);
    }
    else if (role === "admin") {
      res.write(`data: ${JSON.stringify({ event, data: ticketData })}\n\n`);
    }
  });
};