import AWS from 'aws-sdk';

const getRegionFromContext = (context) => {
    return /^arn:aws:lambda:([^:]+)/.exec(context.invokedFunctionArn)[1];
};

export default (context) => {
    const cfg = {region: getRegionFromContext(context)};

    AWS.config.update(cfg);

    return cfg;
};