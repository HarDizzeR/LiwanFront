const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ticket must have a Title!"],
    },
    description: {
      type: String,
      required: [true, "Ticket must have a Description!"],
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "Employee",
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: "Department",
      required: [true, "Ticket must be Assigned To a department!"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    status: {
      type: String,
      enum: {
        values: ["completed", "pending"],
      },
      default: "pending",
    },
    response: {
      createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "Employee",
      },
      createdAt: {
        type: Date,
      },
      description: {
        type: String,
      },
      fileUploaded: String,
    },
    fileUploaded: {
      type: String
    },
    filePath: {
      type: String
    },
    hidden: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

ticketSchema.pre(/^find/, function (next) {
  this.populate({ path: "assignedTo", select: "name" })
    .populate({ path: "createdBy", select: "fname lname" })
    .populate({ path: "response.createdBy", select: "fname lname" });
  next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;