require("./setup");
import { expect } from 'chai';
import promisify from 'es6-promisify';
import testContext from './lambda-context';
const lambda = promisify(require('../src/lambdas/channels').default);

describe("channels", () => {

    describe("create", () => {

        it("should create a channel", () => {
            const event = {
                action: "create",
                channelName: "test-channel",
                title: "channel-title",
                identity: "0"
            };

            return lambda(event, testContext).then(data => {
                expect(data.name).to.equal(event.channelName);
                expect(data.title).to.equal(event.title);
                expect(data.ownerUserId).to.equal(event.identity);
                expect(data.created).to.exist;
            });
        });

        it("should fail when a channel with that name already exists.", () => {
            const event = {
                action: "create",
                channelName: "test-channel",
                title: "channel-title",
                identity: "0"
            };

            const create = () => lambda(event, testContext);

            return expect(create().then(create)).to.be.rejected;
        });

    });

    describe("update", () => {

        it("should update the title of a channel", () => {
            const create = () => lambda({
                action: "create",
                channelName: "update-test-channel",
                title: "first title"
            }, testContext);

            const update = () => lambda({
                action: "update",
                channelName: "update-test-channel",
                title: "new title",
                identity: "0"
            }, testContext);

            return create().then(update).then(data => expect(data.title).to.equal("new title"));
        });

    });

    describe("get", () => {

        it("should return a channel", () => {
            const create = () => lambda({
                action: "create",
                channelName: "get-test-channel"
            }, testContext);

            const get = () => lambda({
                action: "get",
                channelName: "get-test-channel"
            }, testContext);

            return create().then(get).then(data => expect(data.channelName).to.equal("get-test-channel"));
        });

        it("should return a channel with users", () => {
            const create = () => lambda({
                action: "create",
                channelName: "get-test-channel"
            }, testContext);

            const get = () => lambda({
                action: "get",
                channelName: "get-test-channel"
            }, testContext);

            return create().then(get).then(data => expect(data.users).to.exist);
        });

        it("should return a channel the timestamp that the returned info was valid", () => {
            const create = () => lambda({
                action: "create",
                channelName: "get-test-channel"
            }, testContext);

            const get = () => lambda({
                action: "get",
                channelName: "get-test-channel"
            }, testContext);

            return create().then(get).then(data => expect(data.timestamp).to.exist);
        });

    });

    describe("join", () => {

        it("should join the current user to a channel", () => {
            const event = {
                action: "join",
                channelName: "test-channel",
                identity: "0"
            };

            return lambda(event, testContext);
        });

    });

    describe("leave", () => {

        it("should remove the current user from a channel", () => {
            const event = {
                action: "leave",
                channelName: "test-channel",
                identity: "0"
            };

            return lambda(event, testContext);
        });

    });

});