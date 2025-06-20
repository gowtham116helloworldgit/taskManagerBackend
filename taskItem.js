const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'taskdata.db')
let db = null

const startServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})

    app.listen(3000, () => {
      console.log(`server is running at localhost 3000`)
    })
  } catch (error) {
    console.error('DB Connection Error:', error.message)
    process.exit(1)
  }
}
startServer()

app.get('/gettasks', async (request, response) => {
  const query = `SELECT * from taskItems;`
  const tasksArray = await db.all(query)
  response.send(tasksArray)
})

app.post('/posttasks', async (request, response) => {
  const taskDetails = request.body
  const {title, description, status, due_date} = taskDetails
  const taskPostQuery = `INSERT INTO taskItems (title,description,status,due_date) values('${title}','${description}','${status}','${due_date}');`
  const dbResponse = await db.run(taskPostQuery)
  const taskId = dbResponse.lastID
  response.send({taskId: taskId})
})
//update Query
app.put('/updatetask/:taskId', async (request, response) => {
  const updateTaskDetails = request.body
  const {taskId} = request.params
  const {title, description, status, due_date} = updateTaskDetails
  const updateTaskQuery = `
  UPDATE taskItems SET 
  title='${title}',
  description='${description}',
  status='${status}',
  due_date='${due_date}' 
  where id=${taskId};
  `
  await db.run(updateTaskQuery)
  response.send('updated successfully')
})
// delete book
app.delete('/deleteTask/:taskId', async (request, response) => {
  const {taskId} = request.params
  const deleteTaskQuery = `delete from taskItems where id=${taskId};`
  await db.run(deleteTaskQuery)
  response.send('Delete SuccessFully')
})
