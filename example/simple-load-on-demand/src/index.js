import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import VanillaJoi from 'joi';
import JoiFk from 'joi-fk-extension';
import JoiUniqueValue from 'joi-unique-value-extension';
import { Nav, GenericRoute, Validation, Save, Cancel } from 'react-auto-edit';
import MyRepository from './MyRepository';

import 'react-auto-edit/example.css';

const Joi = VanillaJoi
  .extend(JoiFk.fkNumber)
  .extend(JoiFk.fkString)
  .extend(JoiUniqueValue.uniqueString)
  .extend(JoiUniqueValue.uniqueNumber)

const schema = Joi.object({
  countries: Joi.array().items({
    countryId: Joi.number().required().tags('PK')
      .unique('countries.[].countryId')
      .description('Unique ID for the country'),
    countryName: Joi.string().required().max(50).tags('name'),
  }),
  cities: Joi.array().items({
    cityId: Joi.number().required().tags('PK')
      .unique('cities.[].cityId')
      .description('Unique ID for the city'),
    cityName: Joi.string().required().max(50).tags('name'),
    countryId: Joi.number().required().fk('countries.[].countryId'),
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

// class MyRepository extends Repository {
//   async save() {
//     alert('I don\'t do anything in this example');
//   }

//   // async load() {
//   //   const response = await fetch('/data/data.json');
//   //   const newData = await response.json();
//   //   this.reset(newData);
//   // }

//   // async cancel() {
//   //   await this.load();
//   // }
// }

const App = ({ repository }) => <Router>
  <Nav repository={repository}/>
  <Validation repository={repository}/>
  <Save repository={repository}/>
  <Cancel repository={repository}/>
  <GenericRoute repository={repository}/>
</Router>;

const repository = new MyRepository(schema, {});
ReactDOM.render(<App repository={repository} />, document.getElementById('root'));

// repository.load();

// const main = async () => {
//   const response = await fetch('/data/data.json');
//   const newData = await response.json();
//   newData.countries = newData.countries.filter((c1, i1) => !newData
//     .countries.find((c2, i2) => (c1.countryName === c2.countryName) && (i2 > i1)))
//     .map((c, i) => ({
//       countryId: i+55,
//       countryName: c.countryName,
//     }));
//   newData.cities = newData.cities.map((city) => {
//     const result = Object.assign({}, city);
//     result.countryId = newData.countries[Math.floor(Math.random() * newData.countries.length)].countryId;
//     return result;
//   });
//   console.log(JSON.stringify(newData, null, 2));
// }

// main();

