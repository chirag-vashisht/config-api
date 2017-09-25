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
    const controller = proxyquire('../../../controllers/configuration/get-configuration', {
        '../../modules/app-config': configModuleMock,
    });
    const testController = new TestController(controller);
    it('Should call getConfigByNamespace function and return valid ApiResponse with status OK',
        (done) => {
            const request = {
                params: {
                    namespace: 'test',
                },
            };
            const response = { locals: {}, setHeader() { }, };
            configHelperMock.getConfigByNamespace = sinon.stub().resolves({});
            testController.run(request, response, (err, req, res) => {
                expect(err).to.be.equal(undefined);
                expect(res.locals.apiResponse).to.be.instanceof(ApiResponse);
                expect(res.locals.apiResponse.statusCode)
                    .to.be.equal(HttpStatus.OK);
                sinon.assert.calledWith(configHelperMock.getConfigByNamespace,
                    request.params.namespace);
                done();
            });
        });
    it('Should respond with error if getConfigByNamespace function returns error',
        (done) => {
            const request = {
                params: {
                    namespace: 'test',
                },
            };
            const response = { locals: {}, setHeader() { }, };
            const error = new Error('mock');
            configHelperMock.getConfigByNamespace = sinon.stub().rejects(error);
            testController.run(request, response, (err, req, res) => {
                expect(err).to.be.equal(error);
                expect(res.locals.apiResponse).to.be.equal(undefined);
                sinon.assert.calledWith(configHelperMock.getConfigByNamespace,
                    request.params.namespace);
                done();
            });
        });
});
