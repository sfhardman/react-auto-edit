import VanillaJoi from 'joi';
import JoiFk from 'joi-fk-extension';
import utils from '../src/utils';

const Joi = VanillaJoi.extend(JoiFk.fkNumber)
  .extend(JoiFk.fkString);

describe('utils', () => {
  describe('getArrayItemPath', () => {
    it('identifies item in collection by Pks', () => {
      const parentSchema = Joi.array().items({
        idPartOne: Joi.string().tags('PK'),
        idPartTwo: Joi.number().tags('PK'),
        name: Joi.string(),
      });
      const item = {
        idPartOne: 'fred',
        idPartTwo: 77,
        name: 'Frederick',
      };
      const result = utils.getArrayItemPath(
        item, parentSchema.describe(), 'people',
      );
      expect(result).toBe('people.["fred",77]');
    });
    it('escapes special characters', () => {
      const parentSchema = Joi.array().items({
        idPartOne: Joi.string().tags('PK'),
        idPartTwo: Joi.string().tags('PK'),
        name: Joi.string(),
      });
      const item = {
        idPartOne: 'fr.ed',
        idPartTwo: '[bob]',
        name: 'Frederick',
      };
      const result = utils.getArrayItemPath(
        item, parentSchema.describe(), 'people',
      );
      expect(result).toBe('people.["fr.ed","[bob]"]');
    });
  });
  describe('dotPathToUrlPath', () => {
    it('produces an url path', () => {
      const result = utils.dotPathToUrlPath(
        'people.["fred"].children',
      );
      expect(result).toBe('/people/["fred"]/children');
    });
    it('handles special characters', () => {
      const result = utils.dotPathToUrlPath(
        'people.["fr.ed"].children',
      );
      expect(result).toBe('/people/["fr.ed"]/children');
    });
  });
  describe('urlPathToDotPath', () => {
    it('produces a dot path', () => {
      const result = utils.urlPathToDotPath(
        'people/["fr/ed"]/children',
      );
      expect(result).toBe('people.["fr/ed"].children');
    });
  });
  describe('getItemForPath', () => {
    it('gets the item', () => {
      const schema = Joi.object({
        people: Joi.array().items({
          id: Joi.string().tags('PK'),
        }),
      });
      const data = {
        people: [
          { id: 'bob' },
          { id: 'fr.ed' },
        ],
      };
      const result = utils.getItemForPath(
        'people.["fr.ed"]',
        schema.describe(),
        data,
      );
      expect(result).toBeTruthy();
      expect(result.id).toBe('fr.ed');
    });
    it('handles new items', () => {
      const schema = Joi.object({
        people: Joi.array().items({
          id: Joi.string().tags('PK'),
        }),
      });
      const data = {
        people: [
          { id: 'bob' },
        ],
      };
      const newItem = {};
      data.people.push(newItem);
      const result = utils.getItemForPath(
        'people.["+++1"]',
        schema.describe(),
        data,
      );
      expect(result).toBeTruthy();
      expect(result).toBe(newItem);
    });
  });
  describe('dotPathIsNewItem', () => {
    it('returns false on normal array references', () => {
      expect(utils.dotPathIsNewItem('a.[4]')).toBeFalsy();
    });
    it('rejects true on special array references', () => {
      expect(utils.dotPathIsNewItem('a.["+++0"]')).toBeTruthy();
    });
  });
});
