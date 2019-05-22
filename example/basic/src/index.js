import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import VanillaJoi from 'joi';
import JoiFk from 'joi-fk-extension';
import JoiUniqueValue from 'joi-unique-value-extension';
import { Nav, Repository, GenericRoute, Validation, Save, Cancel } from 'react-auto-edit';
import cities from './cities';
import people from './people';

import 'react-auto-edit/example.css';

const Joi = VanillaJoi
  .extend(JoiFk.fkNumber)
  .extend(JoiFk.fkString)
  .extend(JoiUniqueValue.uniqueString)
  .extend(JoiUniqueValue.uniqueNumber)

const schema = Joi.object({
  cities: Joi.array().items({
    cityId: Joi.number().required().tags('PK')
      .unique('cities.[].cityId')
      .description('Unique ID for the city'),
    cityName: Joi.string().required().max(50).tags('name'),
  }),
  people: Joi.array().items({
    personId: Joi.string().required().tags('PK')
      .unique('people.[].personId')
      .description('Unique ID for the person'),
    name: Joi.string().required().max(50),
    nickname: Joi.string().optional().max(50).allow(''),
    homeCityId: Joi.number().fk('cities.[].cityId').required()
      .label('Home City'),
    children: Joi.array().items({
      personId: Joi.string().required().tags('PK')
        .fk('people.[].personId')
    }),  
  }),
});

// generate some random data

const data = {
  cities: cities.map((item, index) => ({
    cityId: index,
    cityName: item.cityName,
  })),
  people: people.map((item, index) => ({
    personId: `PN${index}`,
    name: item.fullName,
    nickname: (Math.random() < 0.1) ? item.fullName.substring(0, 3) : '',
    homeCityId: Math.floor(Math.random() * (cities.length - 1)),
    children: people
      .filter(childItem => childItem !== item)
      .map((childItem, childIndex) => ({
        personId: `PN${childIndex}`,
      }))
      .filter(() => Math.random() < 0.001)
  })),
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

