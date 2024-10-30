const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TimeRecord = sequelize.define('TimeRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recordType: {
    type: DataTypes.ENUM('entrada', 'saida', 'almoco-entrada', 'almoco-saida'),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = TimeRecord;

