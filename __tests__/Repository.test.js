
import VanillaJoi from 'joi';
import JoiFk from 'joi-fk-extension';
import Repository from '../src/Repository';

const Joi = VanillaJoi.extend(JoiFk.fkNumber)
  .extend(JoiFk.fkString);

const schema = Joi.object({
  people: Joi.array().items({
    personId: Joi.number().tags('PK'),
    name: Joi.string(),
  }),
});

const data = {
  people: [
    { personId: 1, name: 'z' },
    { personId: 2, name: 'a' },
    { personId: 3, name: 'b' },
    { personId: 4, name: 'e' },
    { personId: 5, name: 'd' },
    { personId: 6, name: 'r' },
    { personId: 7, name: 'v' },
    { personId: 8, name: 't' },
    { personId: 9, name: 'y' },
    { personId: 10, name: 'o' },
  ],
};

const itemSchema = schema.describe().children.people;

describe('Repository', () => {
  describe('getSummary', () => {
    it('returns first page correctly', () => {
      const repo = new Repository(schema, data, 3);
      const result = repo.getSummary('people', itemSchema, 1);

      expect(result.count).toEqual(10);
      expect(result.page).toEqual(1);
      expect(result.totalPages).toEqual(4);
      expect(result.item).toMatchObject([
        { personId: 2, name: 'a' },
        { personId: 3, name: 'b' },
        { personId: 5, name: 'd' },
      ]);
    });
    it('returns final page correctly', () => {
      const repo = new Repository(schema, data, 3);
      const result = repo.getSummary('people', itemSchema, 4);

      expect(result.count).toEqual(10);
      expect(result.page).toEqual(4);
      expect(result.totalPages).toEqual(4);
      expect(result.item).toMatchObject([
        { personId: 1, name: 'z' },
      ]);
    });
    it('returns correct page count with evenly divisible number', () => {
      const repo = new Repository(schema, data, 5);
      const result = repo.getSummary('people', itemSchema, 1);

      expect(result.count).toEqual(10);
      expect(result.page).toEqual(1);
      expect(result.totalPages).toEqual(2);
    });
  });
});
