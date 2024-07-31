const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const should = chai.should()
const expect = chai.expect
const server = require('../server');

chai.use(chaiHttp);

let issue1;
let issue2;

suite('Functional Tests', function() {
  this.timeout(5000);
  // # 1
  test("Create an issue with every POST field", function(done) {
    chai
    .request(server)
    //.keepOpen()
    .post("/api/issues/testing123")
    .set("content-type", "application/json")
    .send({      
        issue_title: "test_title",
        issue_text: "test_text",
        created_by: "test_author",
        assigned_to: "test_coder",
        status_text: "test_status"
    })
    .end(function(err, res) {
      assert.equal(res.status, 200)
      issue1 = res.body;
      assert.equal(res.body.issue_title, "test_title")
      assert.equal(res.body.issue_text, "test_text")
      assert.equal(res.body.created_by, "test_author")
      assert.equal(res.body.assigned_to, "test_coder")
      assert.equal(res.body.status_text, "test_status")
      done();
    })
  }).timeout(10000)

  // # 2
  test("Create an issue with only required POST field", function(done) {
    chai
    .request(server)
    //.keepOpen()
    .post("/api/issues/testing123")
    .set("content-type", "application/json")
    .send({
        issue_title: "required_title",
        issue_text: "required_text",
        created_by: "required_author",
        assigned_to: "",
        status_text: ""
    })
    .end(function(err, res) {
      assert.equal(res.status, 200)
      issue2 = res.body
      assert.equal(res.body.issue_title, "required_title")
      assert.equal(res.body.issue_text, "required_text")
      assert.equal(res.body.created_by, "required_author")
      assert.equal(res.body.assigned_to, "")
      assert.equal(res.body.status_text, "")
      done();
    })
  }).timeout(5000)

  // # 3
  test("Create an issue with missing required fields", function(done) {

    chai
    .request(server)
    //.keepOpen()
    .post("/api/issues/testing123")
    .set("content-type", "application/json")
    .send({
        issue_title: "",
        issue_text: "",
        created_by: "required_author",
        assigned_to: "",
        status_text: ""
    })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.equal(res.body.error, "required field(s) missing")
      done();
    })
  }).timeout(5000)

  // # 4
  test("View issues on a project", function(done) {
    chai
    .request(server)
    .keepOpen()
    .get("/api/issues/testing123")
    .end(function(err, res) {
      assert.equal(res.status, 200)
      assert.equal(res.type, "application/json");
      done();
    })
  })

  // # 5
  test("View issues on a project with one filter", function(done) {
    chai
    .request(server)
    .keepOpen()
    .get("/api/issues/testing123")
    .query({
        _id: issue1._id
    })
    .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body[0].issue_title, issue1.issue_title)
        assert.equal(res.body[0].issue_text, issue1.issue_text)
        done();
    })
  })

  // #6
  test("View issues on a project with multiple filters", function(done) {
    chai
    .request(server)
    .keepOpen()
    .get("/api/issues/testing123")
    .query({
        issue_title: issue1.issue_title,
        issue_text: issue1.issue_text
    })
    .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body[0].issue_title, issue1.issue_title)
        assert.equal(res.body[0].issue_text, issue1.issue_text)
        done();
    })
  })
    // #7
  test("Update one field on an issue", function(done) {
    chai
    .request(server)
    .keepOpen()
    .put("/api/issues/testing123")
    .send({
        _id: issue1._id,
        issue_title: "modified title 1"
    })
    .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.result, "successfully updated")
        assert.equal(res.body._id, issue1._id)
        done();
    })
  })

    // #8
    test("Update multiple fields on an issue", function(done) {
        chai
        .request(server)
        .keepOpen()
        .put("/api/issues/testing123")
        .send({
            _id: issue1._id,
            issue_title: "modified title 2",
            issue_text: "modified text 1",
            created_by: "modified author 1"
        })
        .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.body.result, "successfully updated")
            assert.equal(res.body._id, issue1._id)
            done()
        })
      })
    
    // #9
    test("Update an issue with missing _id", function(done){
      chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testing123")
      .send({
        issue_title: "modified title 2",
        issue_text: "modified text 1",
        created_by: "modified author 1"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, "missing _id")
        done()
      })
    })

    // #10
    test("Update an issue with no fields to update", function(done){
        chai
        .request(server)
        .keepOpen()
        .put("/api/issues/testing123")
        .send({
            _id: issue1._id
        })
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.error, "no update field(s) sent")
          done()
        })
      })
    
    // #11
    test("Update an issue with an invalid _id", function(done) {
        chai
        .request(server)
        .keepOpen()
        .put("/api/issues/testing123")
        .send({
          _id: "65a10b30bbc1tf41b04c4a70"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.error, "no update field(s) sent")
          done()
        })
    })

    // #12
    test("Delete an issue", function(done) {
      chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/testing123")
      .send({
        _id: issue1._id
      })
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.result, "successfully deleted")
      })
      chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/testing123")
      .send({
        _id: issue2._id
      })
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.result, "successfully deleted")
        done()
    })
  })

    // #13
    test("Delete an issue with invalid _id", function(done) {
        chai
        .request(server)
        .keepOpen()
        .delete("/api/issues/testing123")
        .send({
          _id: "65a10b30bbc1tf41b04c4a70"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.error, "could not delete")
          done()
        })
      })
    
    // #14
    test("Delete an issue with missing _id", function(done) {
    chai
    .request(server)
    .keepOpen()
    .delete("/api/issues/testing123")
    .send({})
    .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, "missing _id")
        done()
    })
  })    
})