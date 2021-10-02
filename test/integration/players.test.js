const request = require('supertest');
// const faker = require('faker');
const httpStatus = require('http-status');

const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { User } = require('../../src/models');
const { userOne, userTwo, userThree, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, insertToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Players routes', () => {
  const newUser = { name: 'bader' };

  describe('POST /players', () => {
    test('should return 201 and succesfuly create new user', async () => {
      await insertUsers([userOne]);
      await insertToken();

      const res = await request(app)
        .post('/players')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: newUser.name,
        games: [],
        succes_rate: 0,
        lost: 0,
        won: 0,
      });

      const dbUser = await User.findById(res.body.user.id).lean();
      expect(dbUser).toBeDefined();
    });
    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/players').send(newUser).expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 400 error if name is already used', async () => {
      await insertUsers([userOne]);
      await insertToken();

      await request(app)
        .post('/players')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      await request(app)
        .post('/players')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 201 and succesfully create new user without name', async () => {
      await insertUsers([userOne]);
      await insertToken();

      const res = await request(app)
        .post('/players')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.CREATED);

      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: 'ANÒNIM-1',
        games: [],
        succes_rate: 0,
        lost: 0,
        won: 0,
      });

      const res2 = await request(app)
        .post('/players')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.CREATED);

      expect(res2.body.user).toEqual({
        id: expect.anything(),
        name: 'ANÒNIM-2',
        games: [],
        succes_rate: 0,
        lost: 0,
        won: 0,
      });
    });
  });

  describe('PUT /players/:name', () => {
    const newName = { name: 'newName' };
    test('should return 200 and successfully update user if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertToken();

      const res = await request(app)
        .put(`/players/${userTwo.name}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newName)
        .expect(httpStatus.OK);

      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: newName.name,
        games: [],
        succes_rate: 0,
        lost: 0,
        won: 0,
      });
    });
    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);
      await insertToken();
      await request(app).put(`/players/${userTwo.name}`).send(newName).expect(httpStatus.UNAUTHORIZED);
    });
    test("should return 400 error if name dosen't exist", async () => {
      await insertUsers([userOne]);
      await insertToken();

      await request(app)
        .put(`/players/name`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newName)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if name already exist', async () => {
      await insertUsers([userOne, userTwo]);
      await insertToken();

      await request(app)
        .put(`/players/name`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ name: 'userTwo' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if you try to change admin name', async () => {
      await insertUsers([userOne, userTwo]);
      await insertToken();

      await request(app)
        .put(`/players/name`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ name: 'admin' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if you tray to change inexistent user', async () => {
      await insertUsers([userOne, userTwo]);
      await insertToken();
      await request(app)
        .put(`/players/jahsjhkasjhsad`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ name: 'jkahskdas' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /players/:name', () => {
    test('should return 401 error if access token is missing', async () => {
      await request(app).post(`/players/${userTwo.name}`).expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 200 if player exists', async () => {
      await insertUsers([userOne, userTwo]);
      await insertToken();
      const res = await request(app)
        .post(`/players/${userTwo.name}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        dice1: expect.anything(),
        dice2: expect.anything(),
        result: expect.anything(),
        succes_rate: expect.anything(),
      });
    });
  });

  describe('DELETE /players/name', () => {
    test('should return 200 and delete all the games', async () => {
      await insertUsers([userOne, userTwo]);
      await insertToken();

      await request(app)
        .post(`/players/${userTwo.name}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      await request(app)
        .post(`/players/${userTwo.name}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      const res = await request(app)
        .delete(`/players/${userTwo.name}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: userTwo.name,
        games: [],
        succes_rate: 0,
        lost: 0,
        won: 0,
      });
    });
    test('should return 401 error if access token is missing', async () => {
      await request(app).post(`/players/${userTwo.name}`).expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 400 error if name dosen't exist", async () => {
      await insertUsers([userOne]);
      await insertToken();
      await request(app)
        .delete(`/players/bader`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /players', () => {
    test('should return 200 and get all the players', async () => {
      await insertUsers([userOne, userTwo, userThree]);
      await insertToken();
      const { body } = await request(app)
        .get(`/players`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);
      expect(body.users.length).toEqual(2);
    });

    test('should return 200 if there are no users yet', async () => {
      await insertUsers([userOne]);
      await insertToken();
      const res = await request(app)
        .get(`/players`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        users: [],
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/players/${userTwo.name}`).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /players/:name', () => {
    test('should return 200 and get the player', async () => {
      await insertUsers([userOne, userTwo]);
      await insertToken();
      const { body } = await request(app)
        .get(`/players/${userTwo.name}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(body.user).toEqual({
        id: expect.anything(),
        name: userTwo.name,
        games: [],
        succes_rate: 0,
        lost: 0,
        won: 0,
      });
    });

    test("should return 400 error if user dosn't exist", async () => {
      await insertUsers([userOne]);
      await insertToken();
      await request(app)
        .get(`/players/bader`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/players/${userTwo.name}`).expect(httpStatus.UNAUTHORIZED);
    });
  });
});
