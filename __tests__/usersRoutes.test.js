const request = require("supertest");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");

describe("User Routes Test", function () {
    let userToken 

    beforeEach(async function () {
        await db.query("DELETE FROM messages");
        await db.query("DELETE FROM users");
    
        let u1 = await User.register({
          username: "test1",
          password: "password",
          first_name: "Test1",
          last_name: "Testy1",
          phone: "+14155550000",
        });

        let u2 = await User.register({
            username: "test2",
            password: "password",
            first_name: "Test2",
            last_name: "Testy2",
            phone: "+14155550000",
        });

        let m1 = await Message.create({
            from_username: "test1",
            to_username: "test2",
            body: "u1-to-u2"
        });

        let m2 = await Message.create({
        from_username: "test2",
        to_username: "test1",
        body: "u2-to-u1"
        });

        const testUser = { username: "test1" };
        userToken = jwt.sign(testUser, SECRET_KEY);
    });

    describe('GET /users', function () {
        test("returns list of users", async function () {
          const response = await request(app)
            .get(`/users`)
            .send({ _token: userToken });
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ users: [{
                username: "test1",
                first_name: "Test1",
                last_name: "Testy1",
                phone: "+14155550000",
                },
                {
                    username: "test2",
                    first_name: "Test2",
                    last_name: "Testy2",
                    phone: "+14155550000",
                }]
            });
        });
    });

    describe('GET /users/:username', function () {
        test("returns detail of a user", async function () {
          const response = await request(app)
            .get(`/users/test1`)
            .send({ _token: userToken });
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ user: {
                username: "test1",
                first_name: "Test1",
                last_name: "Testy1",
                phone: "+14155550000",
                join_at: expect.any(String),
                last_login_at:expect.any(String),
                }
            });
        });

        test("fails returning detail of a user", async function () {
            const response = await request(app)
              .get(`/users/fail`)
              .send({ _token: userToken });
              expect(response.statusCode).toBe(401);
        });
    });

    describe('GET /users/:username/to', function () {
        test("returns messages to user", async function () {
          const response = await request(app)
            .get(`/users/test1/to`)
            .send({ _token: userToken });
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ messages: [{
                id: expect.any(Number),
                from_user: {
                    username: "test2",
                    first_name: "Test2",
                    last_name: "Testy2",
                    phone: "+14155550000",
                },
                body: "u2-to-u1",
                sent_at: expect.any(String),
                read_at:null}]
            });
        });

        test("fails returning messages to user", async function () {
            const response = await request(app)
              .get(`/users/nouser/to`)
              .send({ _token: userToken });
              expect(response.statusCode).toBe(401);
          });
    });

    describe('GET /users/:username/from', function () {
        test("returns messages from user", async function () {
          const response = await request(app)
            .get(`/users/test1/from`)
            .send({ _token: userToken });
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ messages: [{
                id: expect.any(Number),
                to_user: {
                    username: "test2",
                    first_name: "Test2",
                    last_name: "Testy2",
                    phone: "+14155550000",
                },
                body: "u1-to-u2",
                sent_at: expect.any(String),
                read_at:null}]
            });
        });

        test("fails returning messages from user", async function () {
            const response = await request(app)
              .get(`/users/test1/from`)
              .send({ _token: "notoken" });
              expect(response.statusCode).toBe(401);
          });
    });
})

afterAll(async function () {
    await db.end();
})