require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
var morgan = require('morgan')

const Person = require('./models/person')
const { response } = require('express')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

morgan.token('body', function getBody (req) {
  if (req.method==="POST"){
    return JSON.stringify(req.body)
  }
  return " "
})

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

let persons = [
    {
      id: 1,
      name: "Arto Hellas",
      number: "040-123456"
    },
    {
      id: 2,
      name: "Ada Lovelcae",
      number: "39-44-5323523"
    },
    {
      id: 3,
      name: "Dan Abramov",
      number: "12-43-234345"
    },
    {
      id: 4,
      name: "Mary Poppendick",
      number: "39-23-6423122"
    }
  ]

  app.get('/info', (req, res, next) => {
    Person.countDocuments({}, function (err, count) {
      const date = new Date()
      const teksti = '<p>Phonebook has info for ' + count + ' persons</p>' + 
    '<p>' + date + '</p>'
      res.send(teksti)
    });
    

    
  })

  /*
  app.get('/api/persons', (req, res) => {
    res.json(persons)
  })
  */
 
  app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
  })

  /*
  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })
  */
  app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
      .then(person => {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
  })

  /*
  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

  */

  app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

  app.post('/api/persons/', (request, response, next) => {
    const body = request.body
    const id = Math.floor(Math.random() * 100000)
    /*
    const person = {
        id: id,
        name: body.name,
        number: body.number
        
    }
    */
    const person = new Person({
      name: body.name,
      number: body.number
    })

    if (!body.name) {
      return response.status(400).json({ 
        error: 'name missing' 
      })
    }

    if (!body.number) {
      return response.status(400).json({ 
        error: 'number missing' 
      })
    }

    /*
    if (persons.filter(person => person.name === body.name).length > 0) {
      return response.status(400).json({ 
        error: 'name must be unique' 
      })
    }
    */
    /*
    persons = persons.concat(person)

    response.json(person)
    */
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
  })

  app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }

    if (!body.number) {
      return response.status(400).json({ 
        error: 'number missing' 
      })
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

  app.use(unknownEndpoint)
  app.use(errorHandler)

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })