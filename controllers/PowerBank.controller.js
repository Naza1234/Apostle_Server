const PowerBank = require('../models/PowerBank.model');

// Create a PowerBank
exports.createPowerBank = async (req, res) => {
  try {
    console.log(req.body);
    const newPowerBank = new PowerBank(req.body);
    await newPowerBank.save();
    res.status(201).json(newPowerBank);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all PowerBanks
exports.getAllPowerBanks = async (req, res) => {
  try {
    const powerBanks = await PowerBank.find();
    res.status(200).json(powerBanks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get total NumberInStor and NumberOnLine
exports.getTotalInventoryStatus = async (req, res) => {
  try {
    const powerBanks = await PowerBank.find();

    const totals = powerBanks.reduce(
      (acc, pb) => {
        acc.totalInStor += pb.NumberInStor || 0;
        acc.totalOnline += pb.NumberOnLine || 0;
        return acc;
      },
      { totalInStor: 0, totalOnline: 0 }
    );

    res.status(200).json(totals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get PowerBank by ID
exports.getPowerBankById = async (req, res) => {
  try {
    const { id } = req.params;
    const powerBank = await PowerBank.findById(id);
    if (!powerBank) return res.status(404).json({ error: 'PowerBank not found' });
    res.status(200).json(powerBank);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update PowerBank
exports.updatePowerBank = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PowerBank.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updatePowerBanksNumber = async (req, res) => {
  try {
    const updates = req.body; // Should be an array of objects with _id, NumberInStor, and NumberOnLine

    const updatePromises = updates.map(({ _id, NumberInStor, NumberOnLine }) =>
      PowerBank.findByIdAndUpdate(
        _id,
        { NumberInStor, NumberOnLine },
        { new: true }
      )
    );

    const updatedPowerBanks = await Promise.all(updatePromises);

    res.status(200).json(updatedPowerBanks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};