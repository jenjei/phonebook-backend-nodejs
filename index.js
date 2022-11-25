require('dotenv').config()
const Person = require('./models/person')

const express = require('express')
const morgan = require('morgan') // https://github.com/expressjs/morgan documentation here
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny')) // tiny formatted morgans, PROBLEM custom tokens not working and dont know why

// GET placeholder page, for now this endpoint leads to frontend
app.get('/', (request, response) => {
  response.send('<p>helllooooo</p>')
})

// GET all people
app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

// GET info
app.get('/info', (request, response) => {
  Person.count({}, function(error, num ) {
    console.log('I have ' + num + ' persons in my phonebook')
    response.send('<p>Phonebook has info for ' + num + ' people.</p>'
  + '<p></p>' + Date())
  })
})

// creating endpoint for one contact, GET one person
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      next(error)
    })
})

// deleting one contact, DELETE
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      console.log('deleted', result)
      response.status(204).end()
    })
    .catch(error => next(error))
})

// PUT, updating one contact
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new:true, runValidators:true, context:'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// creating new person, POST
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person ({
    name: body.name,
    number: body.number
  })

  Person.find({}).then(result => {
    if (person.name === result.name) { // PROBLEM: case sensitive when should be not case sensitive
      console.log('name must be unique')
      response.status(400).end()
    }
    else {
      person.save().then((result) => {
        console.log('added ', result.name, result.number, ' to the phonebook')
        response.json(result)
      }).catch(error => next(error))
    }
  })
})

// error handlers here:
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log('first:', error.message)
  console.log('name:', error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})