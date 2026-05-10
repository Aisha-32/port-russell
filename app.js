require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const auth = require("./middleware/auth");

// Models
const User = require("./models/User");
const Product = require("./models/Product");
const Catway = require("./models/catways");
const Reservation = require("./models/reservations");

const app = express();

// ================= CONFIG =================

connectDB();

app.use(express.json());

app.use(express.static("public"));

// Logout
app.get("/logout", (req, res) => {
  res.json({
    message: "Logout success"
  });
});


const PORT = process.env.PORT || 3000;

// ================= AUTH =================

// Register
app.post("/users", async (req, res) => {

  try {

    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});



// Login
app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        message: "Wrong password"
      });

    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});




console.log("LOGOUT ROUTE LOADED");





// ================= USERS =================

// GET all users
app.get("/users", auth, async (req, res) => {

  try {

    const users = await User.find()
      .select("-password");

    res.json(users);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

// GET user by ID
app.get("/users/id/:id", auth, async (req, res) => {

  try {

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

// GET user by email
app.get("/users/email/:email", auth, async (req, res) => {

  try {

    const user = await User.findOne({
      email: req.params.email
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

// UPDATE user
app.put("/users/:email", auth, async (req, res) => {

  try {

    const updates = { ...req.body };

    if (updates.password) {

      updates.password = await bcrypt.hash(
        updates.password,
        10
      );

    }

    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      updates,
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

// DELETE user
app.delete("/users/:email", auth, async (req, res) => {

  try {

    await User.findOneAndDelete({
      email: req.params.email
    });

    res.json({
      message: "User deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

// ================= HOME =================

app.get("/", (req, res) => {
  res.send("Port Russell API is running");
});

// ================= PRODUCTS =================

// GET products
app.get("/products", async (req, res) => {

  const products = await Product.find();

  res.json(products);

});

// CREATE product
app.post("/products", async (req, res) => {

  const product = await Product.create(req.body);

  res.status(201).json(product);

});

// ================= CATWAYS =================

// GET all catways
app.get("/catways", auth, async (req, res) => {

  const catways = await Catway.find();

  res.json(catways);

});

// GET one catway
app.get("/catways/:id", auth, async (req, res) => {

  const catway = await Catway.findOne({
    catwayNumber: req.params.id
  });

  if (!catway) {

    return res.status(404).json({
      message: "Catway not found"
    });

  }

  res.json(catway);

});

// CREATE catway
app.post("/catways", auth, async (req, res) => {

  const catway = await Catway.create(req.body);

  res.status(201).json(catway);

});

// UPDATE catway
app.put("/catways/:id", auth, async (req, res) => {

  const catway = await Catway.findOneAndUpdate(

    { catwayNumber: req.params.id },

    { catwayState: req.body.catwayState },

    { new: true }

  );

  if (!catway) {

    return res.status(404).json({
      message: "Catway not found"
    });

  }

  res.json(catway);

});

// DELETE catway
app.delete("/catways/:id", auth, async (req, res) => {

  const catway = await Catway.findOneAndDelete({
    catwayNumber: req.params.id
  });

  if (!catway) {

    return res.status(404).json({
      message: "Catway not found"
    });

  }

  res.json({
    message: "Catway deleted"
  });

});

// ================= RESERVATIONS =================

// CREATE reservation
app.post("/catways/:id/reservations", auth, async (req, res) => {

  const reservation = await Reservation.create({

    ...req.body,

    catwayNumber: req.params.id,

    user: req.user.id

  });

  res.status(201).json(reservation);

});

// GET reservations
app.get("/reservations", auth, async (req, res) => {

  const reservations = await Reservation.find({
    user: req.user.id
  });

  res.json(reservations);

});

// UPDATE reservation
app.put(
  "/catways/:catwayId/reservations/:reservationId",
  auth,
  async (req, res) => {

    try {

      const reservation = await Reservation.findOne({

        _id: req.params.reservationId,

        catwayNumber: req.params.catwayId

      });

      if (!reservation) {

        return res.status(404).json({
          message: "Reservation not found"
        });

      }

      if (
        reservation.user.toString() !== req.user.id
      ) {

        return res.status(401).json({
          message: "Not authorized"
        });

      }

      reservation.clientName =
        req.body.clientName || reservation.clientName;

      reservation.boatName =
        req.body.boatName || reservation.boatName;

      reservation.startDate =
        req.body.startDate || reservation.startDate;

      reservation.endDate =
        req.body.endDate || reservation.endDate;

      await reservation.save();

      res.json(reservation);

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }
);

// DELETE reservation
app.delete(
  "/catways/:id/reservations/:reservationId",
  auth,
  async (req, res) => {

    const reservation =
      await Reservation.findByIdAndDelete(
        req.params.reservationId
      );

    if (!reservation) {

      return res.status(404).json({
        message: "Reservation not found"
      });

    }

    res.json({
      message: "Reservation deleted"
    });

  }
);

// ================= SERVER =================

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});