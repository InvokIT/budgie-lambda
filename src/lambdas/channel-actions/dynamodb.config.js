export default {
    channelActions: {
        tableName: "budgie-channel-actions",
        saveParams: (params) => {
            params.Item.created = Date.now()
        },
        queries: {
            byChannelNameAndCreatedAfter: (channelName, created) => {
                return {
                    IndexName: "channelName-created-index",
                    KeyConditionExpression: "channelName = :cn and created > :c",
                    ExpressionAttributeValues: {
                        ":cn": channelName,
                        ":c": created
                    }
                };
            }
        }
    }
}