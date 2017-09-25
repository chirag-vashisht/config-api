var AWS = require('aws-sdk');
var config = require('config');
var uuid = require('node-uuid');
var lodash = require('lodash');
var logger  = require('./logger');

// init AWS SDK config
AWS.config.update(config.get("aws.credentials"));

// define module
var files = {};
module.exports = files;

/**
 * Upload given stream to AWS S3. Error if any, and Uploaded object metadata will be provided to callback.
 * @param {stream.Readable} fileStream - readable stream.
 * @param {String} fileName - file name.
 * @param {String} mimeType - data MIME type.
 * @param {function(Error,Object)} callback = callback function.
 * @returns {{abort:function}}
 */
files.upload = function (fileStream, fileName, mimeType, callback) {

    // s3 object metadata
    var metadata = {
        Bucket: config.get("aws.s3.bucket"),
        Key: uuid.v4(),
        ACL: 'private',
        ContentType: mimeType,
        Body: fileStream
    };
logger.info("file upload helper - start",'metadata', metadata);
    // do upload, return upload object so that it 'abort' can be called on it if needed.
    return new AWS.S3.ManagedUpload({params:metadata}).send(function (err, data) {
        if(err){
          logger.info("file upload helper - err",'ManagedUpload', err);
            callback(err,undefined);
        }else {
            // head the object, so we can get actual Content Length etc.
            new AWS.S3().headObject(lodash.pick(metadata,['Bucket','Key']),function(err,objData){
                if(err){
                  logger.info("file upload helper - err",'headObject', err);
                    callback(err,undefined);
                }else {
                  logger.info("file upload helper - success",'headObject', objData);

                    callback(undefined, {
                        object_key: metadata.Key,
                        content_type: metadata.ContentType,
                        content_length: objData.ContentLength,
                        file_name: fileName,
                        s3_url: data.Location,
                        s3_e_tag: lodash.trim(data.ETag,'\"'), // S3 adds extra quotes to ETag, strange.
                        timestamp: Date.parse(objData.LastModified)
                    });
                }
            });
        }
    });

};

/**
 * Download AWS S3 object to given stream. Callback will be called to notify end of download as well any error.
 * @param {String} objectKey - S3 object key.
 * @param {stream.Writable} outStream - writable stream.
 * @param {function(Error)} callback - callback function.
 */
files.download = function(objectKey,outStream,callback){

    // stream s3 object
    var inStream = new AWS.S3().getObject({
        Bucket:config.get("aws.s3.bucket"),
        Key:objectKey
    }).createReadStream();
  logger.info("file download helper - start",'headObject', objectKey);
    // callback stream events
    var cb = lodash.once(callback);
    inStream.on('error',cb);
    inStream.on('end',cb);
    inStream.on('close',cb);

    // pipe
    inStream.pipe(outStream);
};



/**
 * Download thumb image AWS S3 object to given stream. Callback will be called to notify end of download as well any error.
 * @param {String} objectKey - S3 object key.
 * @param {stream.Writable} outStream - writable stream.
 * @param {function(Error)} callback - callback function.
 */
files.downloadThumb = function(objectKey,outStream,callback){

    // stream s3 object
    var inStream = new AWS.S3().getObject({
        Bucket:config.get("aws.s3.thumb_bucket"),
        Key:objectKey + '_thumb'
    }).createReadStream();

    // callback stream events
    var cb = lodash.once(callback);
    inStream.on('error',cb);
    inStream.on('end',cb);
    inStream.on('close',cb);

    // pipe
    inStream.pipe(outStream);
};
