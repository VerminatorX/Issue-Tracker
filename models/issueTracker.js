const mongoose = require("mongoose")

const IssueSchema = new mongoose.Schema({
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: {
    type: String,
    default: ""
  },
  status_text: {
    type: String,
    default: ""
  },
  created_on: String,
  updated_on: String,
  open: {
    type: Boolean,
    default: true
  }
})

const Issue = mongoose.model("Issue", IssueSchema)

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  issues: [IssueSchema]
})

const Project = mongoose.model("Project", ProjectSchema)


exports.Issue = Issue;
exports.Project = Project;