const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const { request, response } = require('express');
const app = express()

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
  ];



  app.use(express.json()) //parses JSON data
  app.use(cors()) //cross origin resource sharing
  app.use(express.static('build')) //for static file reading

  morgan.token('data', (req, res) => {
    return JSON.stringify(req.body)
  })
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data')) //logs activity
  
  const generateID = () => {
    const maxNum = Number.MAX_SAFE_INTEGER
    const newID =  Math.floor(Math.random(10) * maxNum)
    return newID
  }

  app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    } else if (!body.number) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }
    
    const everyPerson = persons.map(person => person.name.toLowerCase())

    if (everyPerson.includes(body.name.toLowerCase())) {
      return response.status(400).json({ 
        error: 'name must be unique' 
      })
    }

    const person = {
      name: body.name,
      number: body.number,
      id: generateID(),
    }
    
    persons = persons.concat(person)
    response.json(person)
  })

  app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })

  app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

  app.get('/api/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
        `
    )
  })

  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
  })

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })