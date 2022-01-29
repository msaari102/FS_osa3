const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://kayttaja:${password}@cluster0.obgu0.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: process.argv[3] || "",
  number: process.argv[4] ||""
})

if (process.argv.length<5){
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person.name + ' ' + person.number)
        })
        mongoose.connection.close()
      })
} else {
    person.save().then(result => {
        console.log('added ' + process.argv[3] + 'number ' + process.argv[4] + 'to phonebook')
        mongoose.connection.close()
      })
}

