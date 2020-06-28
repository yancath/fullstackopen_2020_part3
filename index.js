require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const { request, response } = require('express');
const app = express()
const mongoose = require('mongoose')
const Person = require('./models/person')


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

    if (body.name === undefined) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    } else if (body.number === undefined) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }

    const person = new Person({ //new person obj based off the schema
      name: body.name,
      number: body.number
    })
    
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })

  app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })

  app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
  })

  app.get('/api/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
        `
    )
  })

  app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => { //in Person model, find by given id
      response.json(person)
    })
  })

  app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
  })

  app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson.toJSON())
      })
      .catch(error => next(error))
  })

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return response.status(400).send({ error: 'malformatted id' })
    } 

    next(error)
  }
  app.use(errorHandler)

  const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

  