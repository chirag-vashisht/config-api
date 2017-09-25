const chai = require('chai');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const TestController = require('node-seed-core').TestController;
const ApiResponse = require('api-lib').core.ApiResponse;
const HttpStatus = require('http-status-codes');
const sinon = require('sinon');

const expect = chai.expect;

describe('Get Config Controller', () => {
    const configHelperMock = {};
    const configModuleMock = {
        helpers: {
            configHelper: configHelperMock,
        },
    };
    const controller = proxyquire('../../../controllers/configuration/get-configurations', {
        '../../modules/app-config': configModuleMock,
    });
    const testController = new TestController(controller);
    it('Should call getConfigurations function and return valid ApiResponse with status OK',
        (done) => {
            const request = {
            };
            const response = { locals: {}, setHeader() { }, };
            configHelperMock.getConfigurations = sinon.stub().resolves({});
            testController.run(request, response, (err, req, res) => {
                expect(err).to.be.equal(undefined);
                expect(res.locals.apiResponse).to.be.instanceof(ApiResponse);
                expect(res.locals.apiResponse.statusCode)
                    .to.be.equal(HttpStatus.OK);
                sinon.assert.calledWith(configHelperMock.getConfigurations);
                done();
            });
        });
    it('Should respond with error if getConfigurations function returns error',
        (done) => {
            const request = {
            };
            const response = { locals: {}, setHeader() { }, };
            const error = new Error('mock');
            configHelperMock.getConfigurations = sinon.stub().rejects(error);
            testController.run(request, response, (err, req, res) => {
                expect(err).to.be.equal(error);
                expect(res.locals.apiResponse).to.be.equal(undefined);
                sinon.assert.calledWith(configHelperMock.getConfigurations);
                done();
            });
        });
});
