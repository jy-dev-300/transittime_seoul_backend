"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const inserturlparams_1 = __importDefault(require("inserturlparams"));
const server_1 = __importDefault(require("@src/server"));
const UserRepo_1 = __importDefault(require("@src/repos/UserRepo"));
const User_1 = __importDefault(require("@src/models/User"));
const HttpStatusCodes_1 = __importDefault(require("@src/common/HttpStatusCodes"));
const UserService_1 = require("@src/services/UserService");
const Paths_1 = __importDefault(require("spec/support/Paths"));
const apiCb_1 = __importDefault(require("spec/support/apiCb"));
const classes_1 = require("@src/common/classes");
// Dummy users for GET req
const getDummyUsers = () => {
    return [
        User_1.default.new('Sean Maxwell', 'sean.maxwell@gmail.com'),
        User_1.default.new('John Smith', 'john.smith@gmail.com'),
        User_1.default.new('Gordan Freeman', 'gordan.freeman@gmail.com'),
    ];
};
// Tests
describe('UserRouter', () => {
    let agent;
    // Run before all tests
    beforeAll(done => {
        agent = supertest_1.default.agent(server_1.default);
        done();
    });
    // Get all users
    describe(`"GET:${Paths_1.default.Users.Get}"`, () => {
        // Setup API
        const api = (cb) => agent
            .get(Paths_1.default.Users.Get)
            .end((0, apiCb_1.default)(cb));
        // Success
        it('should return a JSON object with all the users and a status code ' +
            `of "${HttpStatusCodes_1.default.OK}" if the request was successful.`, (done) => {
            // Add spy
            const data = getDummyUsers();
            spyOn(UserRepo_1.default, 'getAll').and.resolveTo(data);
            // Call API
            api(res => {
                expect(res.status).toBe(HttpStatusCodes_1.default.OK);
                expect(res.body).toEqual({ users: data });
                done();
            });
        });
    });
    // Test add user
    describe(`"POST:${Paths_1.default.Users.Add}"`, () => {
        const ERROR_MSG = classes_1.ValidationErr.GetMsg('user'), DUMMY_USER = getDummyUsers()[0];
        // Setup API
        const callApi = (user, cb) => agent
            .post(Paths_1.default.Users.Add)
            .send({ user })
            .end((0, apiCb_1.default)(cb));
        // Test add user success
        it(`should return a status code of "${HttpStatusCodes_1.default.CREATED}" if the ` +
            'request was successful.', (done) => {
            // Spy
            spyOn(UserRepo_1.default, 'add').and.resolveTo();
            // Call api
            callApi(DUMMY_USER, res => {
                expect(res.status).toBe(HttpStatusCodes_1.default.CREATED);
                done();
            });
        });
        // Missing param
        it(`should return a JSON object with an error message of "${ERROR_MSG}" ` +
            `and a status code of "${HttpStatusCodes_1.default.BAD_REQUEST}" if the user ` +
            'param was missing.', (done) => {
            // Call api
            callApi(null, res => {
                expect(res.status).toBe(HttpStatusCodes_1.default.BAD_REQUEST);
                expect(res.body.error).toBe(ERROR_MSG);
                done();
            });
        });
    });
    // Update users
    describe(`"PUT:${Paths_1.default.Users.Update}"`, () => {
        const ERROR_MSG = classes_1.ValidationErr.GetMsg('user'), DUMMY_USER = getDummyUsers()[0];
        // Setup API
        const callApi = (user, cb) => agent
            .put(Paths_1.default.Users.Update)
            .send({ user })
            .end((0, apiCb_1.default)(cb));
        // Success
        it(`should return a status code of "${HttpStatusCodes_1.default.OK}" if the ` +
            'request was successful.', (done) => {
            // Setup spies
            spyOn(UserRepo_1.default, 'update').and.resolveTo();
            spyOn(UserRepo_1.default, 'persists').and.resolveTo(true);
            // Call api
            callApi(DUMMY_USER, res => {
                expect(res.status).toBe(HttpStatusCodes_1.default.OK);
                done();
            });
        });
        // Param missing
        it(`should return a JSON object with an error message of "${ERROR_MSG}" ` +
            `and a status code of "${HttpStatusCodes_1.default.BAD_REQUEST}" if the user ` +
            'param was missing.', (done) => {
            // Call api
            callApi(null, res => {
                expect(res.status).toBe(HttpStatusCodes_1.default.BAD_REQUEST);
                expect(res.body.error).toBe(ERROR_MSG);
                done();
            });
        });
        // User not found
        it('should return a JSON object with the error message of ' +
            `"${UserService_1.USER_NOT_FOUND_ERR}" and a status code of ` +
            `"${HttpStatusCodes_1.default.NOT_FOUND}" if the id was not found.`, (done) => {
            // Call api
            callApi(DUMMY_USER, res => {
                expect(res.status).toBe(HttpStatusCodes_1.default.NOT_FOUND);
                expect(res.body.error).toBe(UserService_1.USER_NOT_FOUND_ERR);
                done();
            });
        });
    });
    // Delete User
    describe(`"DELETE:${Paths_1.default.Users.Delete}"`, () => {
        // Call API
        const callApi = (id, cb) => agent
            .delete((0, inserturlparams_1.default)(Paths_1.default.Users.Delete, { id }))
            .end((0, apiCb_1.default)(cb));
        // Success
        it(`should return a status code of "${HttpStatusCodes_1.default.OK}" if the ` +
            'request was successful.', (done) => {
            // Setup spies
            spyOn(UserRepo_1.default, 'delete').and.resolveTo();
            spyOn(UserRepo_1.default, 'persists').and.resolveTo(true);
            // Call api
            callApi(5, res => {
                expect(res.status).toBe(HttpStatusCodes_1.default.OK);
                done();
            });
        });
        // User not found
        it('should return a JSON object with the error message of ' +
            `"${UserService_1.USER_NOT_FOUND_ERR}" and a status code of ` +
            `"${HttpStatusCodes_1.default.NOT_FOUND}" if the id was not found.`, done => {
            // Setup spies
            callApi(-1, res => {
                expect(res.status).toBe(HttpStatusCodes_1.default.NOT_FOUND);
                expect(res.body.error).toBe(UserService_1.USER_NOT_FOUND_ERR);
                done();
            });
        });
    });
});
