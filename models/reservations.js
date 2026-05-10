const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  catwayNumber: Number,
  clientName: String,
  boatName: String,
  startDate: Date,
  endDate: Date,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Reservation", reservationSchema);