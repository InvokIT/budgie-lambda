import { isFunction } from 'lodash';
import { createRepo } from '../../dynamodb';
import dynamoCfg from './dynamodb.config';

const channelsRepo = (ctx) => createRepo(ctx, dynamoCfg.channels);

const actions = {

    get(event, context) {
        return channelsRepo(context).get({"name": event.channelName});
    },

    update(event, context) {
        const profile = Object.assign(context.profile, {userId: event.identity});
        return channelsRepo(context).save(profile);
    }
};

export default (event, context, callback) => {
    const action = actions[event.action];

    if (!isFunction(action)) {
        callback(new Error("Unknown action " + event.action));
        return;
    }

    action(event, context)
        .then(r => callback(null, r))
        .catch(callback);
};