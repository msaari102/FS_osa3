import React, { useState, useEffect } from 'react'
import axios from 'axios'
import noteService from './services/persons'

const Notification = ({errorMessage, successMessage}) => {
  if (errorMessage === null) {
    if (successMessage === null) {
      return null
    }
    return (
      <div className="success">
        {successMessage}
      </div>
    )
  }
  return (
    <div className="error">
      {errorMessage}
    </div>
  )
}

const Person = ({person, persons, setPersons, setSuccessMessage}) => {
  return (
    <li> {person.name} {person.number} <Button handleClick={() =>
      {if (window.confirm(`Delete ${person.name}?`)){
      noteService
      .remove(person.id)
      .then(response => {
        setPersons(persons.filter(n => n.id != person.id))
      })
    }
    setSuccessMessage(
      `Deleted ${person.name}`
    )
    setTimeout(() => {
      setSuccessMessage(null)
    }, 5000)
  }
    } text="delete" /></li>
  )
}

const Button = (props) => (
  <button onClick={props.handleClick}>
    {props.text}
  </button>
)

const Filter = (props) => {
  const newFilter = props.newFilter
  const handleFilterChange = props.handleFilterChange
  return (
    <form>
    <div>
      filter shown with: <input value = {newFilter}
      onChange = {handleFilterChange} />
    </div>
  </form>
  )
}

const PersonForm = (props) => {
  const addName = props.addName
  const newName = props.newName
  const handleNameChange = props.handleNameChange
  const newNumber = props.newNumber
  const handleNumberChange = props.handleNumberChange
  return (
    <form onSubmit={addName}>
    <div>
      name: <input value={newName}
      onChange={handleNameChange}/>
    </div>
    <div>
      number: <input value={newNumber}
      onChange={handleNumberChange}/>
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
  )
}

const Persons = (props) => {
  const setErrorMessage = props.setErrorMessage
  const persons = props.persons
  const newFilter = props.newFilter
  const setPersons = props.setPersons
  const setSuccessMessage = props.setSuccessMessage
  const personsToShow =
  persons.filter(person => person.name.toLowerCase().includes(newFilter.toLowerCase()))
  return (
    <ul>
    {personsToShow.map(person => 
      <Person key = {person.name} person={person} persons={persons} setPersons = {setPersons}
      setErrorMessage={setErrorMessage} setSuccessMessage={setSuccessMessage}/>
    )}
  </ul>
  )
}

const App = () => {
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')
  const [persons, setPersons] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const addName = (event) => {
    event.preventDefault()
    const person = persons.filter(n => n.name === newName)
    if (person.length<1){
      const noteObject = {
        name: newName,
        number: newNumber
      }
      noteService
      .create(noteObject)
      .then(response => {
        setPersons(persons.concat(response.data))
        setNewName('')
        setNewNumber('')
      }).catch(error => {
        setErrorMessage(
          error.response.data.error
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })

      setSuccessMessage(
        `Added ${newName}`
      )
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      
    } else {
      const changedPerson = { ...person[0], number: newNumber }
      if (window.confirm(`${person[0].name} is already added to phonebook, replace old number with a new one?`)){
        noteService
          .update(person[0].id,changedPerson)
          .then(response => {
            setPersons(persons.map(n => n.id != person[0].id ? n : changedPerson))
            setNewName('')
            setNewNumber('')
            setSuccessMessage(
              `Changed ${newName} phone number`
            )
            setTimeout(() => {
              setSuccessMessage(null)
            }, 5000)
      })
      .catch(error => {
        setErrorMessage(
          `Information of ${newName} has already been removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setPersons(persons.filter(n => n.id !==  person[0].id))
      })
      }
      
    }
  } 

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setNewFilter(event.target.value)
  }

  useEffect(() => {
    noteService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
  }, [])

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification errorMessage={errorMessage} successMessage = {successMessage} />
        <Filter newFilter = {newFilter} handleFilterChange = {handleFilterChange} />
      <h3>add a new</h3>
        <PersonForm addName = {addName} newName = {newName} handleNameChange = {handleNameChange}
        newNumber = {newNumber} handleNumberChange = {handleNumberChange} 
        setErrorMessage = {setErrorMessage} setSuccessMessage = {setSuccessMessage} />
      <h2>Numbers</h2>
        <Persons persons = {persons} newFilter = {newFilter} setPersons = {setPersons} 
        setErrorMessage = {setErrorMessage} setSuccessMessage = {setSuccessMessage}/>
    </div>
  )

}

export default App