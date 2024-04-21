const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null
const filePath = path.join(__dirname, 'todoApplication.db')
app.use(express.json())
const intialize = async (request, response) => {
  db = await open({
    filename: filePath,
    driver: sqlite3.Database,
  })
  app.listen(3000, () => {
    console.log('App is running at 3000')
  })
}

intialize()
function tofu(ans) {
  return {
    id: ans.id,
    todo: ans.todo,
    priority: ans.priority,
    status: ans.status,
  }
}
app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', search_q = ''} = request.query
  const decodedStatus = decodeURIComponent(status)
  const decodedPriority = decodeURIComponent(priority)
  const decodedSearchQ = decodeURIComponent(search_q)
  if (status !== '' && priority !== '') {
    const query = `select * from todo where status like '%${decodedStatus}%' and priority like '%${decodedPriority}%'`
    const ans = await db.all(query)
    response.send(ans)
  }
  if (status !== '') {
    const query = `select * from todo where status like '%${decodedStatus}%'`
    const ans = await db.all(query)
    response.send(ans)
  }
  if (priority !== '') {
    const query = `select * from todo where priority like '%${decodedPriority}%'`
    const ans = await db.all(query)
    response.send(ans)
  }
  if (search_q !== '') {
    const query = `select * from todo where todo like '%${decodedSearchQ}%'`
    const ans = await db.all(query)
    response.send(ans.map(x => tofu(x)))
  }
})
app.get('/todos/:todoId/', async (request, response) => {
  try {
    const {todoId} = request.params
    const query = `select * from todo where id=${todoId}`
    const ans = await db.get(query)
    response.send(ans)
  } catch (e) {
    console.log(`${e.message}`)
  }
})

app.post('/todos/', async (request, response) => {
  const body = request.body
  const {id, todo, priority, status} = body
  const query = `insert into todo(id,todo,priority,status) values(${id},'${todo}','${priority}','${status}')`
  await db.run(query)
  response.send('Todo Successfully Added')
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `delete from todo where id=${todoId}`
  await db.run(query)
  response.send('Todo Deleted')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {status = '', priority = '', todo = ''} = request.body
  if (status !== '') {
    const query = `update todo set status='${status}' where id=${todoId}`
    await db.run(query)
    response.send('Status Updated')
  } else if (priority !== '') {
    const query = `update todo set priority='${priority}' where id=${todoId}`
    await db.run(query)
    response.send('Priority Updated')
  } else {
    const query = `update todo set todo='${todo}' where id=${todoId}`
    await db.run(query)
    response.send('Todo Updated')
  }
})

module.exports = app
