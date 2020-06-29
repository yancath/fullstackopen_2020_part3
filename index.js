require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const { request, response } = require('express');
const app = express()
const mongoose = require('mongoose')
const Person = require('./models/person')

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

  app.post('/api/persons', (request, response, next) => {
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

    Person.find({name:body.name}).then(name => {
      if (name.length !== 0) {
        return response.status(400).json({ 
          error: 'name must be unique' 
    })
    }
  })

    const person = new Person({ //new person obj based off the schema
      name: body.name,
      number: body.number
    })
    
    person
    .save()
    .then(savedPerson => {
      return savedPerson.toJSON()
    })
    .then(savedFormattedPerson => {
      response.json(savedFormattedPerson)
    })
    .catch(error => next(error))
  })

  app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
  })

  app.get('/api/info', (request, response) => {
    Person.find({}).then(result => {
      response.send(
        `<p>Phonebook has info for ${result.length} people</p>
        <p>${new Date()}</p>
        `
      )
    })
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
