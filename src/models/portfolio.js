var mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection('mongodb://localhost:27017/fmportfolio', {
  useNewUrlParser: true
});

autoIncrement.initialize(connection);

var dataSchema = mongoose.Schema({
  proj_category: String,
  proj_division: Array,
  proj_title: String,
  proj_detail: String,
  proj_start_date: Date,
  proj_end_date: Date,
  proj_location: String,
  proj_target: String,
  concept_images: Array,
  reference_images: Array,
  regist_email: String
});


dataSchema.plugin(autoIncrement.plugin, 'data');
var Data = module.exports = connection.model('data', dataSchema);
