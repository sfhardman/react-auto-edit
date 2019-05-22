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
    it('handles basePath', () => {
      const result = utils.dotPathToUrlPath(
        'people.["fr.ed"].children',
        '/data',
      );
      expect(result).toBe('/data/people/["fr.ed"]/children');
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
    it('handles numeric ids', () => {
      const schema = Joi.object({
        people: Joi.array().items({
          id: Joi.number().tags('PK'),
        }),
      });
      const data = {
        people: [
          { id: 1 },
          { id: 2 },
        ],
      };
      const result = utils.getItemForPath(
        'people.[2]',
        schema.describe(),
        data,
      );
      expect(result).toBeTruthy();
      expect(result.id).toBe(2);
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
    it('gets root item for empty string path', () => {
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
      const result = utils.getItemForPath(
        '',
        schema.describe(),
        data,
      );
      expect(result).toBeTruthy();
      expect(result).toBe(data);
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
  describe('getParentPath', () => {
    it('it returns parent in a normal case', () => {
      const result = utils.getParentPath('people.["bob"]');
      expect(result).toEqual('people');
    });
    it('it returns empty string when parent is root', () => {
      const result = utils.getParentPath('people');
      expect(result).toEqual('');
    });
  });
  describe('getItemDisplayName', () => {
    it('returns the combined PK fields if there are no name fields', () => {
      const schema = Joi.object({
        id1: Joi.string().tags('PK'),
        id2: Joi.number().tags('PK'),
        other: Joi.string(),
      });
      const result = utils.getItemDisplayName({
        id1: 'a',
        id2: 1,
        other: 'c',
      }, schema.describe());
      expect(result).toEqual('a - 1');
    });
    it('returns the field tagged as "name"', () => {
      const schema = Joi.object({
        id1: Joi.string().tags('PK'),
        id2: Joi.string().tags('name'),
        name: Joi.string(),
      });
      const result = utils.getItemDisplayName({
        id1: 'a',
        id2: 'b',
        other: 'c',
      }, schema.describe());
      expect(result).toEqual('b');
    });
    it('returns the field named "name" if there is one', () => {
      const schema = Joi.object({
        id1: Joi.string().tags('PK'),
        name: Joi.string(),
      });
      const result = utils.getItemDisplayName({
        id1: 'a',
        name: 'c',
      }, schema.describe());
      expect(result).toEqual('c');
    });
    it('returns the first field if there\'s nothing else useful', () => {
      const schema = Joi.object({
        id1: Joi.string(),
        other: Joi.string(),
      });
      const result = utils.getItemDisplayName({
        id1: 'a',
        other: 'c',
      }, schema.describe());
      expect(result).toEqual('a');
    });
  });
  // describe('sort', () => {
  //   it('sorts on the name field', () => {
  //     const schema = Joi.object({
  //       items: Joi.array().items({
  //         nm: Joi.string().tags('name'),
  //         other: Joi.string(),
  //       }),
  //     });
  //     const data = {
  //       items: [
  //         { nm: 'c', other: 'a' },
  //         { nm: 'a', other: 'b' },
  //         { nm: 'b', other: 'b' },
  //       ],
  //     };

  //     const result = utils.sort(data.items, schema.describe(), 'items.[]');
  //     expect(result).toMatchObject([
  //       { nm: 'a', other: 'b' },
  //       { nm: 'b', other: 'b' },
  //       { nm: 'c', other: 'a' },
  //     ]);
  //   });
  // });
});
