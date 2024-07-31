'use strict';

const mongoose = require("mongoose")
const IssueModel = require("../models/issueTracker").Issue
const ProjectModel = require("../models/issueTracker").Project
//const ObjectId = require("mongodb").ObjectId;
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {
 

  app.get("/:project", async function(req, res)  {
    let allIssues = await ProjectModel.findOne({ name: project }).select("-__v")
    res.send(allIssues.issues)
  })
  
  app.route('/api/issues/:project')
    // LEARNING AGGREGATION
    .get(async function (req, res) {
        let project = req.params.project
        //console.log(project);
        let allIssues = await ProjectModel.findOne({ name: project })
        

        const {
          _id,
          open,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text
        } = req.query

        function parseBoolean(string) {
          return string === "true" ? true : string === "false" ? false : undefined;
        }
        
        let currentProject = await ProjectModel.aggregate([
            { $match: { name: project } },
            { $unwind: "$issues" },
            req.query._id != undefined
            ? { $match: { "issues._id": new ObjectId(_id) } }
            : { $match: {} },
            req.query.issue_title != undefined
            ? { $match: { "issues.issue_title": issue_title } }
            : { $match: {} },
            req.query.issue_text != undefined
            ? { $match: { "issues.issue_text": issue_text } }
            : { $match: {} },
            req.query.created_by != undefined
            ? { $match: { "issues.created_by": created_by } }
            : { $match: {} },
            req.query.assigned_to != undefined
            ? { $match: { "issues.assigned_to": assigned_to } }
            : { $match: {} },
            req.query.open != undefined
            ? { $match: { "issues.open": parseBoolean(open) } }
            : { $match: {} },
            req.query.status_text != undefined
            ? { $match: { "issues.status_text": status_text } }
            : { $match: {} },
            req.query.created_on != undefined
            ? { $match: { "issues.created_on": created_on } }
            : { $match: {} },
            req.query.updated_on != undefined
            ? { $match: { "issues.updated_on": updated_on } }
            : { $match: {} }
          ])
        

        
        let flatIssues = currentProject.map((i) => i.issues)
        res.json(flatIssues)
      })

    
    .post(async function (req, res) {
      let project = req.params.project;
      //console.log(project)
      
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }

      const newIssue = new IssueModel({ 
        issue_title: issue_title || "", 
        issue_text: issue_text || "",
        created_by: created_by || "", 
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      });
      

      const existingProject = await ProjectModel.findOne({ name: project })
      if (existingProject === null) {
        let newProject = await ProjectModel.create({ name: project })
        //console.log(newProject.name)
        newProject.issues.push(newIssue)
        newProject.save()
      } else {
        existingProject.issues.push(newIssue)
        existingProject.save()
      }
      res.send(newIssue)
      })
    
    .put(async function (req, res){
      let project = req.params.project;

      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
        _id
      } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" })
        return;
      } 

      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        res.json({ error: 'no update field(s) sent', _id: _id })
        return;
      }

/*       try {
        const currentProject = await ProjectModel.findOne({ name: project });
        if (currentProject === null) {
          throw new Error("project not found")
        }
        let currentIssue = await IssueModel.findByIdAndUpdate(_id, {
          ...req.body,
          updated_on: new Date(),
        });
        console.log(currentIssue)
        currentIssue.save();
        res.json({ result: "successfully updated", _id: _id});
      } catch(err) {
        res.json({ error: "could not update", _id: _id });
      }
    }) */
      let currentProject = await ProjectModel.findOne({ name: project })
      if (currentProject === null) {
        res.json({ error: "could not update", _id: _id })
      } else {
        let currentIssue = await currentProject.issues.id(_id)
        //console.log("current issue:", currentIssue)
        if (currentIssue === null) {
          res.json({ error: 'could not update', _id: _id })
          return;
        }
        currentIssue.issue_title = issue_title || currentIssue.issue_title
        currentIssue.issue_text = issue_text || currentIssue.issue_text
        currentIssue.created_by = created_by || currentIssue.created_by
        currentIssue.assigned_to = assigned_to || currentIssue.assigned_to
        currentIssue.status_text = status_text || currentIssue.status_text
        currentIssue.updated_on = new Date()
        currentIssue.open = req.body.open || true
        currentProject.save()
        res.json({  result: 'successfully updated', _id: _id })
      }
    })  



    
    .delete(async function (req, res){

      const { _id } = req.body

      let project = req.params.project;
      let currentProject = await ProjectModel.findOne({ name: project })
      let issueToDelete = await currentProject.issues.id(_id)
      if (!_id) {
        res.json({ error: 'missing _id' })
      } else if (issueToDelete === null) {
        res.json({ error: "could not delete", "_id": _id })
        return;
      } else {
        issueToDelete.deleteOne()
        currentProject.save()
        res.json({ result: 'successfully deleted', '_id': _id })
        //console.log(issueToDelete)
      }

    });

 
    
};
