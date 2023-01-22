const mockingoose = require('mockingoose');
const Homes = require('../../models/Homes');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const request = require('supertest');
const app = require('../../app');

describe('Positive POST /home', () => {
    beforeEach(() => {
        mockingoose.resetAll();
        mockingoose(User).toReturn(
            {
                _id: '632beab54298559b57ff172f',
                first_name: 'John',
                last_name: 'Doe',
                email: 'mail@abv.bg',
                phone_number: '34343434',
                role: 'admin',
                password: '123adminsffe',
            },
            'findOne'
        );
        mockingoose(Homes).toReturn(
            {
                _id: '652beab54298559b57ff172f',
                title: 'Nice house',
                city: 'Dobrich',
                neighborhood: 'Drujba',
                address: 'Blok 42 A 2 8',
                price: '10000',
                size: '150',
                year: '1960',
                description: 'Really nice house, have 2 rooms',
                longitude: '30',
                latitude: '50',
                owner_id: '632beab54298559b57ff172f',
                homeViews: '200',
            },
            'save'
        );
    });

    describe('given the request header berer not exist', () => {
        it('should return a 401', async () => {
            const { statusCode } = await request(app).post(`/home`);
            expect(statusCode).toBe(401);
        });
    });

    describe('given the token is not valid', () => {
        it('should return a 403', async () => {
            const { statusCode } = await request(app)
                .post(`/home`)
                .set('Authorization', `Bearer Wrong Token`);
            expect(statusCode).toBe(403);
        });
    });

    describe('given the user dosent have permission', () => {
        it('should return a 403', async () => {
            const token = jwt.sign(
                { auth_id: '63c93c7ea886abcac9deefe8', auth_role: 'user' },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1d',
                }
            );
            const { statusCode } = await request(app)
                .post(`/home`)
                .set('Authorization', `Bearer ${token}`);
            expect(statusCode).toBe(403);
        });
    });

    describe('given the user is logged in', () => {
        it('should create a new Home and return it', async () => {
            const token = jwt.sign(
                { auth_id: '63c93c7ea886abcac9deefe8', auth_role: 'seller' },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1d',
                }
            );
            const res = await request(app)
                .post('/home')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Nice house',
                    city: 'Dobrich',
                    neighborhood: 'Drujba',
                    address: 'Blok 42 A 2 8',
                    price: '10000',
                    size: '150',
                    year: '1960',
                    description: 'Really nice house, have 2 rooms',
                    longitude: '30',
                    latitude: '50',
                    owner_id: '63c93c7ea886abcac9deefe8',
                });
            console.log(res.body);
            expect(res.status).toEqual(201);
            expect(res.body.title).toEqual('Nice house');
            expect(res.body.city).toEqual('Dobrich');
            expect(res.body.neighborhood).toEqual('Drujba');
            expect(res.body.address).toEqual('Blok 42 A 2 8');
            expect(res.body.price).toEqual('10000');
            expect(res.body.size).toEqual('150');
            expect(res.body.year).toEqual('1960');
            expect(res.body.description).toEqual('Really nice house, have 2 rooms');
            expect(res.body.longitude).toEqual('30');
            expect(res.body.latitude).toEqual('50');
        });
    });
});
