const chai = require('chai');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const Promise = require('bluebird');
const HttpStatusCode = require('http-status-codes');
const sinon = require('sinon');

const expect = chai.expect;

describe('Authentication Middleware', () => {
    const AppConfigModelMock = {};

    const configHelper = proxyquire('../../../modules/app-config/helpers/configHelper', {
        '../models/app-config':
        AppConfigModelMock,
    });

    describe('addConfiguration()', () => {
        it('Should add configuration', (done) => {
            AppConfigModelMock.findById =
                () => Promise.resolve(null);
            AppConfigModelMock.create = data =>
                Promise.resolve(data);
            const data = {
                namespace: 'test',
                description: 'test',
                data: {},
            };
            configHelper.addConfiguration(data).then((result) => {
                expect(result).to.be.deep.equal(data);
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('Should not duplicate namespaces', (done) => {
            AppConfigModelMock.findById =
                () => Promise.resolve({});
            const data = {
                namespace: 'test',
                description: 'test',
                data: {},
            };
            configHelper.addConfiguration(data).then(() => {
                done(new Error('Failed!'));
            }).catch((err) => {
                expect(err.httpCode).to.be.equal(HttpStatusCode.CONFLICT);
                done();
            });
        });
    });
    describe('addConfiguration()', () => {
        it('Should add configuration', () => {
            AppConfigModelMock.aggregate = sinon.spy();
            configHelper.getConfigurations();
            sinon.assert.calledWith(AppConfigModelMock.aggregate, [
                { $project: { namespace: '$_id', description: 1, _id: 0, }, },
            ]);
        });
    });
    describe('updateConfiguration()', () => {
        it('Should update configuration', () => {
            AppConfigModelMock.update = sinon.spy();
            const namespace = 'test';
            const configData = { data: {}, };
            configHelper.updateConfiguration(namespace, configData);
            sinon.assert.calledWith(AppConfigModelMock.update,
                { _id: namespace, }, configData);
        });
    });
    describe('getConfigByNamespace()', () => {
        it('Should return configuration', (done) => {
            const namespace = 'test';
            const doc = { _id: 'test', description: 'test', data: {}, };
            AppConfigModelMock.findById =
                () => Promise.resolve(doc);
            configHelper.getConfigByNamespace(namespace).then((result) => {
                expect(result).to.be.deep.equal({
                    /*eslint-disable */
                    namespace: doc._id,
                    /*eslint-enable */
                    description: doc.description,
                    data: doc.data,
                });
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('Should return 404 if config not found', (done) => {
            const namespace = 'test';
            AppConfigModelMock.findById =
                () => Promise.resolve(null);
            configHelper.getConfigByNamespace(namespace, true)
                .then(() => {
                    done(new Error('Failed'));
                }).catch((err) => {
                    expect(err.httpCode).to.be.equal(HttpStatusCode.NOT_FOUND);
                    done();
                });
        });
    });
    describe('deleteConfiguration()', () => {
        it('Should update configuration', () => {
            AppConfigModelMock.remove = sinon.spy();
            const namespace = 'test';
            configHelper.deleteConfiguration(namespace);
            sinon.assert.calledWith(AppConfigModelMock.remove,
                { _id: namespace, });
        });
    });
});
