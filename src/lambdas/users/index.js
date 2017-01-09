import { createRepo } from '../../dynamodb';
import dynamoCfg from './dynamodb.config';

const userRepo = (ctx) => createRepo(ctx, dynamoCfg.users);

const actions = {

    get(event, context) {
        return userRepo(context).get({"userId": event.userId});
    },

    update(event, context) {
        const profile = Object.assign(context.profile, {userId: event.identity});
        return userRepo(context).save(profile);
    }
};

export default (event, context, callback) => {
    actions[event.action](event, context)
        .then(r => callback(null, r))
        .catch(callback);
};