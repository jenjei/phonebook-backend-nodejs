console.log('hello backend')

const express = require('express')
const morgan = require('morgan') // https://github.com/expressjs/morgan documentation here
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('tiny')) // tiny format with custom token :body

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
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})
  
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  response.send('<p>Phonebook has info for ' + persons.length + ' people.</p>'
  + '<p></p>' + Date())
})

// creating api endpoint for one contact
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id) // Number for turning string to int
  const person = persons.find(person => person.id === id)
    
  if (person) {
      response.json(person)
    } else {
      response.status(404).end() // id not found :(
    }
})

// deleting one contact
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

// creating new person
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) { // jos nimi puuttuu, niin anna error viesti
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!body.number) { // jos numero puuttuu, niin anna error viesti
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const found = persons.find(person => person.name===body.name)
  if(found) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }
  
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(5, 100000000)
  }

  persons = persons.concat(person)

  // console.log(person) -> unnecessary when using morgan
  response.json(person)
  morgan.token('body', (req) => JSON.stringify(req.body)) // for some reason this token works sometimes and sometimes not
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})