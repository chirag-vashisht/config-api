const chai = require('chai');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const TestController = require('node-seed-core').TestController;
const ApiResponse = require('api-lib').core.ApiResponse;
const HttpStatus = require('http-status-codes');
const sinon = require('sinon');

const expect = chai.expect;

describe('Add Config Controller', () => {
    const configHelperMock = {};
    const configModuleMock = {
        helpers: {
            configHelper: configHelperMock,
        },
    };
    const controller = proxyquire('../../../controllers/configuration/update-config', {
        '../../modules/app-config': configModuleMock,
    });
    const testController = new TestController(controller);
    it('Should call updateConfiguration function and return valid ApiResponse with status OK',
        (done) => {
            const request = {
                body: {
                },
                params: {
                    namespace: 'test',
                },
            };
            const response = { locals: {}, setHeader() { }, };
            configHelperMock.updateConfiguration = sinon.stub().resolves({});
            testController.run(request, response, (err, req, res) => {
                expect(err).to.be.equal(undefined);
                expect(res.locals.apiResponse).to.be.instanceof(ApiResponse);
                expect(res.locals.apiResponse.statusCode)
                    .to.be.equal(HttpStatus.OK);
                sinon.assert.calledWith(configHelperMock.updateConfiguration,
                    request.params.namespace, request.body);
                done();
            });
        });
    it('Should respond with error if updateConfiguration function returns error',
        (done) => {
            const request = {
                body: {
                },
                params: {
                    namespace: 'test',
                },
            };
            const response = { locals: {}, setHeader() { }, };
            const error = new Error('mock');
            configHelperMock.updateConfiguration = sinon.stub().rejects(error);
            testController.run(request, response, (err, req, res) => {
                expect(err).to.be.equal(error);
                expect(res.locals.apiResponse).to.be.equal(undefined);
                sinon.assert.calledWith(configHelperMock.updateConfiguration,
                    request.params.namespace, request.body);
                done();
            });
        });
});
