const express = require('express');
const router = express.Router();
const powerBankController = require('../controllers/PowerBank.controller');

router.post('/', powerBankController.createPowerBank);
router.get('/', powerBankController.getAllPowerBanks);
router.get('/powerbanks/summary', powerBankController.getTotalInventoryStatus);
router.get('/:id', powerBankController.getPowerBankById);
router.put('/:id', powerBankController.updatePowerBank);
router.put('/powerbankno/editing', powerBankController.updatePowerBanksNumber);

module.exports = router;
