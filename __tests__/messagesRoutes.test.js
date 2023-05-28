const request = require("supertest");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");

describe("Messages Routes Test", function () {
    let userToken, m1, m2, m3
    
    beforeEach(async function () {
        await db.query("DELETE FROM messages");
        await db.query("DELETE FROM users");
        // await db.query("ALTER SEQUENCE messages_id_seq RESTART WITH 1"); 
        // // instead of let m1, m2, m2
    
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

        let u3 = await User.register({
            username: "test3",
            password: "password",
            first_name: "Test3",
            last_name: "Testy3",
            phone: "+14155550000",
        });

        m1 = await Message.create({
            from_username: "test1",
            to_username: "test2",
            body: "u1-to-u2"
        });

        m2 = await Message.create({
        from_username: "test2",
        to_username: "test1",
        body: "u2-to-u1"
        });

        m3 = await Message.create({
            from_username: "test2",
            to_username: "test3",
            body: "u2-to-u3"
        });

        const testUser = { username: "test1" };
        userToken = jwt.sign(testUser, SECRET_KEY);
    });

    describe('GET /messages/:id', function () {
        test("returns message detail", async function () {
            const response = await request(app)
                .get(`/messages/${m1.id}`)
                .send({ _token: userToken });
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: {
                id: m1.id,
                from_user: {
                    username: "test1",
                    first_name: "Test1",
                    last_name: "Testy1",
                    phone: "+14155550000",
                },
                to_user: {
                    username: "test2",
                    first_name: "Test2",
                    last_name: "Testy2",
                    phone: "+14155550000",
                },
                body: "u1-to-u2",
                sent_at: expect.any(String),
                read_at: null,
                }
            });
        });

        test("returns message detail", async function () {
            const response = await request(app)
              .get(`/messages/${m2.id}`)
              .send({ _token: userToken });
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: {
                id: m2.id,
                to_user: {
                    username: "test1",
                    first_name: "Test1",
                    last_name: "Testy1",
                    phone: "+14155550000",
                },
                from_user: {
                    username: "test2",
                    first_name: "Test2",
                    last_name: "Testy2",
                    phone: "+14155550000",
                },
                body: "u2-to-u1",
                sent_at: expect.any(String),
                read_at: null,
            }
            });
        });

        test("fails returning message detailn to unauthorized user", async function () {
            const response = await request(app)
              .get(`/messages/${m3.id}`)
              .send({ _token: userToken });
              expect(response.statusCode).toBe(401);
        });

        test("fails returning bad message id detail", async function () {
            const response = await request(app)
              .get(`/messages/9999999`)
              .send({ _token: userToken });
              expect(response.statusCode).toBe(404);
        });
    });

    describe('POST /messages', function () {
        test("post message", async function () {
          const response = await request(app)
            .post(`/messages`)
            .send({
                to_username: "test3", 
                body: "u1-to-u3",
                _token: userToken 
            });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: {
            id: expect.any(Number),
            from_username: "test1",
            to_username: "test3",
            body: "u1-to-u3",
            sent_at: expect.any(String)
            }
        });
        });

        test("fails posting message", async function () {
            const response = await request(app)
                .post(`/messages`)
                .send({
                    to_username: "wrong", 
                    body: "u1-to-u3",
                    _token: userToken 
                });
            expect(response.statusCode).toBe(500);
            
        });
    });

    describe('POST /messages/:id/read', function () {
        test("post message read", async function () {
          const response = await request(app)
            .post(`/messages/${m2.id}/read`)
            .send({
                _token: userToken 
            });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: {
            id: m2.id,
            read_at: expect.any(String)
            }
        });
        });

        test("fails posting read message", async function () {
            const response = await request(app)
                .post(`/messages/999/read`)
                .send({_token: userToken});
            expect(response.statusCode).toBe(404);            
        });

        test("fails unauthorized posting read message", async function () {
            const response = await request(app)
                .post(`/messages/${m1.id}/read`)
                .send({_token: userToken});
            expect(response.statusCode).toBe(401);            
        });
    });
})

afterAll(async function () {
    await db.end();
})