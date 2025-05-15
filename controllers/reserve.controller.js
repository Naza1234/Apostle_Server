const Reserve = require('../models/Reserve.model');
const User = require('../models/User.model');


// Create a new reserve
exports.createReserve = async (req, res) => {
  try {
    const { UserId, Type, Duration, Amount, Payment } = req.body;

    const newReserve = new Reserve({
      UserId,
      Type,
      Duration,
      Amount,
      Payment
    });

    await newReserve.save();
    res.status(201).json(newReserve);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllReserves = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 100;
    const skip = (page - 1) * limit;

    // Native JS alternative to moment
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    // Fetch and populate
    const allReserves = await Reserve.find()
      .populate("UserId", "UserName")
      .lean();

    // Sort categories
    const reserved = allReserves
      .filter(r => r.Rent === "Reserved")
      .sort((a, b) => new Date(b.Reserved) - new Date(a.Reserved));

    const deniedToday = allReserves
      .filter(r =>
        r.Rent === "Denied" &&
        new Date(r.Reserved) >= todayStart &&
        new Date(r.Reserved) <= todayEnd
      )
      .sort((a, b) => new Date(b.Reserved) - new Date(a.Reserved));

    const others = allReserves
      .filter(r =>
        !(r.Rent === "Reserved" || (r.Rent === "Denied" &&
        new Date(r.Reserved) >= todayStart &&
        new Date(r.Reserved) <= todayEnd))
      )
      .sort((a, b) => new Date(b.Reserved) - new Date(a.Reserved));

    // Combine
    const sorted = [...reserved, ...deniedToday, ...others];

    // Add computed fields
    const processed = sorted.map(r => ({
      ...r,
      UserName: r.UserId?.UserName || "Unknown",
    }));

    const total = processed.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = processed.slice(skip, skip + limit);

    // Check if there's any still-active reserve
    const hasActiveReserved = allReserves.some(r => r.Rent === "Reserved");

    res.status(200).json({
      status: "success",
      total,
      page,
      pages: totalPages,
      data: paginated,
      reserved: hasActiveReserved
    });

  } catch (error) {
    console.error("Error fetching reserves:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all reserves by user ID
exports.getReservesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reserves = await Reserve.find({ UserId: userId })
    res.status(200).json(reserves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a reserve
exports.updateReserve = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Reserve.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a reserve
exports.deleteReserve = async (req, res) => {
  try {
    const { id } = req.params;
    await Reserve.findByIdAndDelete(id);
    res.status(200).json({ message: 'Reserve deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
