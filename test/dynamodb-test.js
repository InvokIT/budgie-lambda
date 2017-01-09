import {expect} from 'chai'
import {createRepo, createId} from '../src/dynamodb';
import lambdaContext from './lambda-context';

const testRepoCfg = {
    tableName: "budgie-test-table",
    queries: {
        byId: (id) => {
            return {
                KeyConditionExpression: "id = :id",
                ExpressionAttributeValues: {
                    ":id": id
                }
            };
        }
    }
};

describe("dynamodb", () => {

    describe("createRepo", () => {

        let repo;

        beforeEach(() => {
            repo = createRepo(lambdaContext, testRepoCfg);
        });

        it("should use a test table", () => {
            expect(repo._tableName).to.equal("test-" + testRepoCfg.tableName);
        });

        it("should save objects", () => {
            const id = createId();
            return repo.save({id: id})
                .then(saved => {
                    expect(saved.length).to.equal(1);
                })
        });

        it("should get objects", () => {
            const id = createId();
            const attrValue = createId();

            const save = () => repo.save({id: id, attr: attrValue});
            const get = () => repo.get({id: id});

            return save().then(get).then(items => expect(items[0].attr).to.equal(attrValue));
        });

        it("should delete objects", () => {
            const id = createId();
            const attrValue = createId();

            const save = () => repo.save({id: id, attr: attrValue});
            const doDelete = () => repo.delete({id: id});
            const get = () => repo.get({id: id});

            return save().then(doDelete).then(get).then(items => expect(items.length).to.equal(0));
        });

        it("should query objects", () => {
            const id = createId();
            const attrValue = createId();

            const save = () => repo.save({id: id, attr: attrValue});
            const query = () => repo.byId(id);

            return save().then(query).then(items => expect(items[0].attr).to.equal(attrValue));
        });

    });
});