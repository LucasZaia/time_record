const TimeRecord = require('../models/time_record');
const User = require('../models/user');
const { getUserByHash } = require('../controllers/user');
const { where } = require('sequelize');


exports.createTimeRecord = async (req, res) => {
  try {
    // Check if user exists
    const user = await getUserByHash(req.body.user_hash);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.password != user.password) {
      return res.status(401).json({ message: 'Senha inválida' });
    }

    const newTimeRecord = await TimeRecord.create({
      userId: user.id,
      recordType: req.body.record_type,
      timestamp: new Date()
    });

    res.status(200).json({message: `Ponto ${req.body.record_type} registrado com sucesso ás 
    
      ${newTimeRecord.timestamp.getHours()}:${newTimeRecord.timestamp.getMinutes().toString().padStart(2, '0')}`});
  } catch (error) {
    res.status(400).json({ message: 'Error creating time record', error: error.message });
  }
};

// Get all time records for a user
exports.getUserTimeRecords = async (req, res, user) => {
  try {

    const userId = user.id;

    let times = [];

    const timeRecords = await TimeRecord.findAll({
      where: {userId: userId},
      order: [['timestamp', 'DESC']]
    });

    return timeRecords;

  } catch (error) {
    res.status(500).json({ message: 'Error fetching time records', error: error.message });
  }
};

// Get a single time record by ID
exports.getTimeRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const timeRecord = await TimeRecord.findByPk(id);
    if (!timeRecord) {
      return res.status(404).json({ message: 'Time record not found' });
    }

    res.status(200).json(timeRecord);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time record', error: error.message });
  }
};

// Update a time record
exports.updateTimeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { recordType, timestamp } = req.body;

    const timeRecord = await TimeRecord.findByPk(id);
    if (!timeRecord) {
      return res.status(404).json({ message: 'Time record not found' });
    }

    timeRecord.recordType = recordType || timeRecord.recordType;
    timeRecord.timestamp = timestamp || timeRecord.timestamp;

    await timeRecord.save();

    res.status(200).json(timeRecord);
  } catch (error) {
    res.status(400).json({ message: 'Error updating time record', error: error.message });
  }
};

// Delete a time record
exports.deleteTimeRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const timeRecord = await TimeRecord.findByPk(id);
    if (!timeRecord) {
      return res.status(404).json({ message: 'Time record not found' });
    }

    await timeRecord.destroy();

    res.status(200).json({ message: 'Time record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting time record', error: error.message });
  }
};
