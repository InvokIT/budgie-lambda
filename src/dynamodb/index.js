import DynamoDB from 'aws-sdk/clients/dynamodb';
import { mapValues, reject, isNil } from 'lodash';
import identity from 'lodash/identity';
import awsConfig from './aws-config';

const dynamoDbEndpoint = process.env.DYNAMODB_ENDPOINT;
const dynamoDbTablePrefix = process.env.DYNAMODB_TABLEPREFIX || (process.env.NODE_ENV === "test" ? "test-" : "");

const prefixTableName = (tableName) => dynamoDbTablePrefix + tableName;

const generateQueryMethod = (queryDef) => {
    return function (...args) {
        return new Promise((resolve, reject) => {
            const params = queryDef(...args);
            params.TableName = this._tableName;

            this._client.query(
                params,
                (err, data) => err ? reject(err) : resolve(data)
            );
        })
            .then(data => data.Items)
    };
};

class DynamoDbRepository {
    constructor(client, {tableName, queries, getParams = identity, saveParams = identity, deleteParams = identity}) {
        this._client = client;
        this._tableName = prefixTableName(tableName);
        this._getParams = getParams;
        this._saveParams = saveParams;
        this._deleteParams = deleteParams;

        Object.defineProperties(this, mapValues(queries, qd => {
            return {
                value: generateQueryMethod(qd)
            };
        }, {}));
    }

    // get(...keys: Array<{[keyName: string]: string}>) {
    //     return new Promise((resolve, reject) => {
    //         this._client.batchGet({
    //             RequestItems: {
    //                 [this._tableName]: {
    //                     Keys: keys
    //                 }
    //             }
    //         }, (err, data) => err ? reject(err) : resolve(data));
    //     }).then(data => data.Responses[this._tableName]);
    // }

    get(...keys: Array<{[keyName: string]: string}>) {
        return Promise.all(keys.map(key => {
            return new Promise((resolve, reject) => {
                const params = this._getParams({
                    TableName: this._tableName,
                    Key: key
                });

                this._client.get(params, (err, data) => err ? reject(err) : resolve(data));
            }).then(data => data.Item);
        })).then(items => reject(items, isNil));
    }

    // save(...objects) {
    //     return new Promise((resolve, reject) => {
    //         this._client.batchWrite({
    //             RequestItems: {
    //                 [this._tableName]: objects.map(o => {
    //                     return {
    //                         PutRequest: {
    //                             Item: o
    //                         }
    //                     };
    //                 })
    //             }
    //         }, (err, data) => err ? reject(err) : resolve(data));
    //     });
    // }

    save(...objects) {
        return Promise.all(objects.map(object => {
            return new Promise((resolve, reject) => {
                const params = this._saveParams({
                    TableName: this._tableName,
                    Item: object
                });

                this._client.put(params, (err, data) => err ? reject(err) : resolve(data));
            }).then(data => data.Attributes);
        }));
    }

    delete(...keys: Array<{[keyName: string]: string}>) {
        return Promise.all(keys.map(key => {
            return new Promise((resolve, reject) => {
                const params = this._deleteParams({
                    TableName: this._tableName,
                    Key: key
                });

                this._client.delete(params, (err, data) => err ? reject(err) : resolve());
            });
        }));
    }
}

export const createRepo = (context, repoCfg) => {
    const cfg = Object.assign({
        apiVersion: '2012-08-10',
        endpoint: dynamoDbEndpoint || undefined
    }, awsConfig(context));

    const client = new DynamoDB.DocumentClient(new DynamoDB(cfg));

    return new DynamoDbRepository(client, repoCfg);
};

export {default as createId} from 'uuid/v4';