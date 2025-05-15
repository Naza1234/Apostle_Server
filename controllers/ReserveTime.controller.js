const ReserveTime = require('../models/ReserveTime.model');

// Create a ReserveTime
exports.createReserveTime = async (req, res) => {
  try {
    const { Name, Price } = req.body;
    const newItem = new ReserveTime({ Name, Price });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all ReserveTimes
exports.getAllReserveTimes = async (req, res) => {
  try {
    const items = await ReserveTime.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ReserveTime by ID
exports.getReserveTimeById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ReserveTime.findById(id);
    if (!item) return res.status(404).json({ error: 'ReserveTime not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update ReserveTime
exports.updateReserveTime = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ReserveTime.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
