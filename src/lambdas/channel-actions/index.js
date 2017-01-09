import { createRepo, createId } from '../../dynamodb';
import dynamoCfg from './dynamodb.config';

const channelActionsRepo = (ctx) => createRepo(ctx, dynamoCfg.channelActions);

const actions = {

    get(event, context) {
        const channelName = event.channelName;
        const newerThan = event.newerThan;

        return channelActionsRepo(context).byChannelNameAndCreatedAfter(channelName, newerThan);
    },

    postMessage(event, context) {
        const channelContent = {
            id: createId(),
            channelName: event.channelName,
            authorUserId: event.identity,
            type: "message",
            content: event.message,
            created: Date.now()
        };

        return channelActionsRepo(context).save(channelContent);
    }
};

export default (event, context, callback) => {
    actions[event.action](event, context)
        .then(r => callback(null, r))
        .catch(callback);
};