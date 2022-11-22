const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://jenniaylis:${password}@cluster0.h5uareh.mongodb.net/Phonebook?retryWrites=true&w=majority` // mongodb+srv://jenniaylis:<password>@cluster0.h5uareh.mongodb.net/?retryWrites=true&w=majority

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
})

if (!person.name && !person.number) {
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
} else {
    person.save().then(result => {
        console.log('added ', result.name, result.number, ' to the phonebook')
        mongoose.connection.close()
    })
}
