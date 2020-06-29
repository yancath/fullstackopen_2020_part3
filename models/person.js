const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');


const url = process.env.MONGODB_URI
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, minlength: 3 },
    number: { type: String, required: true, unique: true, minlength: 8 },
  })

personSchema.plugin(uniqueValidator);

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)

module.exports = Person
