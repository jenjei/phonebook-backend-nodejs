require('dotenv').config()
const Person = require('./models/person')

const express = require('express')
const morgan = require('morgan') // https://github.com/expressjs/morgan documentation here
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny')) // tiny format with custom token :body

app.get('/', (request, response) => {
  response.send('<p>helllooooo</p>')
})
  
app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/info', (request, response) => {
  response.send('<p>Phonebook has info for ' + Person.length + ' people.</p>'
  + '<p></p>' + Date())
})

// creating endpoint for one contact
app.get('/api/persons/:id', (request, response) => {
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
      response.status(400).send({error: 'malformatted id'})
    })
})

// deleting one contact
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

// creating new person
app.post('/api/persons', (request, response) => {
  const body = request.body

  const person = new Person ({
    name: body.name,
    number: body.number,
    id: generateId(5, 100000000)
  })

  if(body.name === undefined) {
    return response.status(400).json({error: 'Name missing'})
  }

  /*if (!body.name) { // jos nimi puuttuu, niin anna error viesti
    return response.status(400).json({ error: 'name missing' })
  }

  if (!body.number) { // jos numero puuttuu, niin anna error viesti
    return response.status(400).json({ error: 'number missing' })
  }*/

  /*const found = Person.find(person => person.name===body.name)
  if(found) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }*/

  person.save().then((result) => {
    console.log('added ', result.name, result.number, ' to the phonebook')
    response.json(result)
  })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})