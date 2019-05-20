import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import VanillaJoi from 'joi';
import JoiFk from 'joi-fk-extension';
import JoiUniqueValue from 'joi-unique-value-extension';
import { Nav, Repository, GenericRoute, Validation, Save, Cancel } from 'react-auto-edit';
import 'react-auto-edit/example.css';

const Joi = VanillaJoi
  .extend(JoiFk.fkNumber)
  .extend(JoiFk.fkString)
  .extend(JoiUniqueValue.uniqueString)
  .extend(JoiUniqueValue.uniqueNumber)

const schema = Joi.object({
  species: Joi.array().items({
    speciesId: Joi.number().required().tags('PK')
      .unique('species.[].speciesId')
      .description('Unique ID for the species'),
    name: Joi.string().required().max(30),
  }),
  animals: Joi.array().items({
    animalId: Joi.string().required().tags('PK')
      .unique('animals.[].animalId')
      .description('Unique ID for the animal'),
    name: Joi.string().required().max(50),
    nickname: Joi.string().optional().max(50),
    speciesId: Joi.number().fk('species.[].speciesId').required()
      .label('Species'),
    offspring: Joi.array().items({
      animalId: Joi.string().required().tags('PK')
        .fk('animals.[].animalId')
    }),  
  }),
});

const data = {
  species: [
    { speciesId: 1, name: 'Tiger' },
    { speciesId: 2, name: 'Koala' },
    { speciesId: 3, name: 'African Elephant' },
  ],
  animals: [
    { animalId: 'tim.tiger', name: 'Timothy', speciesId: 1, 
      nickname: 'Tim',
      offspring: [{ animalId: 'tessatiger' }],
    },
    { animalId: 'tessatiger', name: 'Theresa', speciesId: 1 },
    { animalId: 'kevinkoala', name: 'Kevin', speciesId: 2 }
  ]
};

class MyRepository extends Repository {
  async save() {
    alert('I don\'t do anything in this example');
  }

  async cancel() {
    alert('I don\'t do anything in this example');
  }
}

const repository = new MyRepository(schema, data);

function App() {
  return (
    <Router>
      <Nav repository={repository}/>
      <Validation repository={repository}/>
      <Save repository={repository}/>
      <Cancel repository={repository}/>
      <GenericRoute repository={repository}/>
    </Router>
  );
}



ReactDOM.render(<App />, document.getElementById('root'));

