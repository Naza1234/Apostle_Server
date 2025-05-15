const LateReturnPrice = require('../models/LateReturnPrice.model');

// Create a LateReturnPrice
exports.createLateReturnPrice = async (req, res) => {
  try {
    const { Name, Price } = req.body;
    const newItem = new LateReturnPrice({ Name, Price });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all LateReturnPrices
exports.getAllLateReturnPrices = async (req, res) => {
  try {
    const items = await LateReturnPrice.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get LateReturnPrice by ID
exports.getLateReturnPriceById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LateReturnPrice.findById(id);
    if (!item) return res.status(404).json({ error: 'LateReturnPrice not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update LateReturnPrice
exports.updateLateReturnPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await LateReturnPrice.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
