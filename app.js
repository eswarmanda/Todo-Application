const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// get list
app.get("/", async (request, response) => {
  const getListQuery = `SELECT
        *
     From
        todo;`;
  const dbResponse = await db.all(getListQuery);
  response.send(dbResponse);
});

// get user query
app.get("/todos/", async (request, response) => {
  const requestQuery = request.query;
  const { status, priority, search_q } = requestQuery;
  console.log(requestQuery);
  const getUsersQuery = `SELECT
        * 
     FROM
        todo
     WHERE 
        status = '${status}' OR priority = '${priority}' OR todo LIKE '%${search_q}%' ; `;
  const dbResponse = await db.all(getUsersQuery);
  response.send(dbResponse);
});

// get todoItem by id
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const getTodoItemQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const todoItem = await db.get(getTodoItemQuery);
  response.send(todoItem);
});

// insert todo-data into todo table
app.post("/todos/", async (request, response) => {
  const requestBody = request.body;
  const { id, todo, priority, status } = requestBody;
  const insertTodoQuery = `
    INSERT INTO
        todo (id, todo, priority, status)
    VALUES
        ('${id}','${todo}','${priority}','${status}');`;
  await db.run(insertTodoQuery);
  response.send("Todo Successfully Added");
});

// delete todo
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const deleteTodoItemQuery = `DELETE FROM todo WHERE id = ${todoId}`;
  await db.run(deleteTodoItemQuery);
  response.send("Todo Deleted");
});

//update todoItem by id
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const requestBody = request.body;
  console.log(requestBody);

  const myJSON = JSON.stringify(requestBody);
  let string = "";
  let a = "todo";
  for (let key of myJSON) {
    string += key;
  }
  console.log(string.split(" "));

  const { todo, priority, status } = requestBody;
  if (string.includes("todo")) {
    const getTodoQuery = `
        UPDATE todo SET todo = '${todo}' WHERE id = ${todoId}; `;
    await db.run(getTodoQuery);
    response.send("Todo Updated");
  } else if (string.includes("priority")) {
    const getPriorityQuery = `
        UPDATE todo SET priority = '${priority}' WHERE id = ${todoId}; `;
    await db.run(getPriorityQuery);
    response.send("Priority Updated");
  } else {
    const getStatusQuery = `
        UPDATE todo SET status = '${status}' WHERE id = ${todoId}; `;
    await db.run(getStatusQuery);
    response.send("Status Updated");
  }
});

module.exports = app;
