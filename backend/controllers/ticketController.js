const Ticket = require("../models/ticketModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { notifyClients } = require("./sseController");
const multer = require("multer");
const fs = require("fs");
const cron = require("node-cron");

// File upload configuration
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.employee._id;
    const dir = `./user_ticket/${userId}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ticketTitle = req.body.title.replace(/[^a-zA-Z0-9]/g, '_');
    const fileExtension = file.originalname.split('.').pop();
    cb(null, `${ticketTitle}-${Date.now()}.${fileExtension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/png", "image/jpg", "image/jpeg", "image/webp",
    "application/pdf", "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Not a valid file type! Please upload only images or valid document types.", 400), false);
  }
};

const upload = multer({ storage: fileStorage, fileFilter });
exports.uploadedFile = upload.single("fileUploaded");

// Get all tickets
exports.getAllTickets = catchAsync(async (req, res) => {
  const tickets = await Ticket.find();
  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: { tickets },
  });
});

// Create a new ticket
exports.createTicket = catchAsync(async (req, res, next) => {
  const { title, description, assignedTo } = req.body;
  const filePath = req.file ? req.file.path : undefined;

  const newTicket = await Ticket.create({
    title,
    description,
    assignedTo,
    createdBy: req.employee._id,
    fileUploaded: req.file ? req.file.filename : undefined,
    filePath,
  });

  if (!newTicket) return next(new AppError("Failed to create ticket"));

  notifyClients("new-ticket", newTicket);

  res.status(201).json({
    success: true,
    message: "Ticket created successfully",
    data: { newTicket },
  });
});

// Get a ticket by ID
exports.getTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return next(new AppError("No ticket found with this ID"));
  res.status(200).json({
    status: "success",
    data: { ticket },
  });
});

// Get tickets created by a specific employee
exports.getTicketCreatedBy = catchAsync(async (req, res, next) => {
  const empId = req.params.id;
  const tickets = await Ticket.find({ createdBy: empId });
  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: { tickets },
  });
});

// Get tickets for the logged-in employee
exports.getMyTickets = catchAsync(async (req, res, next) => {
  const empId = req.employee._id;
  const tickets = await Ticket.find({ createdBy: empId });
  if (!tickets) {
    return next(new AppError("No tickets found for this user", 404));
  }
  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: { tickets },
  });
});

// Respond to a ticket
exports.respondToTicket = catchAsync(async (req, res, next) => {
  const { responseDescription } = req.body;
  const filePath = req.file ? req.file.path : undefined;

  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id },
    {
      response: {
        createdBy: req.employee._id,
        createdAt: Date.now(),
        description: responseDescription,
        fileUploaded: req.file ? req.file.filename : undefined,
        filePath,
      },
      status: "completed",
    },
    { new: true, runValidators: true }
  );

  if (!ticket) return next(new AppError("Failed to send Response!"));

  notifyClients("ticket-response", ticket);

  res.status(200).json({
    status: "success",
    data: { ticket },
  });
});

// Get tickets with response
exports.getTicketsWithResponse = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({
    response: { $exists: true, $ne: null },
  });
  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: { tickets },
  });
});

// Get tickets without response
exports.getTicketsWithoutResponse = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({
    $or: [{ response: { $exists: false } }, { response: null }],
  });
  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: { tickets },
  });
});

// Get filtered tickets
exports.getFilteredTickets = catchAsync(async (req, res, next) => {
  const { startDate, endDate, hasResponse } = req.query;
  let filterOptions = {};

  if (startDate || endDate) {
    filterOptions.createdAt = {};
    if (startDate) {
      filterOptions.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filterOptions.createdAt.$lte = endDateTime;
    }
  }

  if (hasResponse !== undefined) {
    if (hasResponse === "true") {
      filterOptions.response = { $exists: true, $ne: null };
    } else if (hasResponse === "false") {
      filterOptions.$or = [
        { response: { $exists: false } },
        { response: null },
      ];
    }
  }

  const tickets = await Ticket.find(filterOptions).sort({ createdAt: -1 });
  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: { tickets },
  });
});

// Get today's tickets
exports.getTodayTickets = catchAsync(async (req, res, next) => {
  const { hasResponse } = req.query;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let filterOptions = {
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  };

  if (hasResponse === "true") {
    filterOptions.response = { $exists: true, $ne: null };
  } else if (hasResponse === "false") {
    filterOptions.$or = [{ response: { $exists: false } }, { response: null }];
  }

  const tickets = await Ticket.find(filterOptions).sort({ createdAt: -1 });
  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: { tickets },
  });
});

// Get tickets sorted by date (ascending)
exports.getTicketsByDateAsc = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find()
    .sort({ createdAt: 1 })
    .populate([
      {
        path: "createdBy",
        select: "fname lname fullName",
      },
      {
        path: "assignedTo",
        select: "name",
      },
    ]);

  if (!tickets) {
    return next(new AppError("No tickets found", 404));
  }

  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: { tickets },
  });
});

// Delete old tickets (scheduled task)
const deleteOldTickets = async () => {
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await Ticket.deleteMany({
    status: "completed",
    createdAt: { $lt: threeMonthsAgo },
  });
  console.log("Old completed tickets deleted");
};

// Schedule the deletion of old tickets
cron.schedule("* * * * *", deleteOldTickets);