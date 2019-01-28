// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, MessageFactory  } = require('botbuilder');

class MyBot {
    /**
     *
     * @param {TurnContext} on turn context object.
     */
    // async onTurn(turnContext) {
    //     // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    //     if (turnContext.activity.type === ActivityTypes.Message) {
    //         await turnContext.sendActivity(`You said '${ turnContext.activity.text }'`);
    //     } else {
    //         await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
    //     }
    // }
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            const text = turnContext.activity.text;

            // Create an array with the valid color options.
            const validColors = ['茶類', '奶類', '果汁類'];

            // If the `text` is in the Array, a valid color was selected and send agreement.
            if (validColors.includes(text)) {
                await turnContext.sendActivity(`好的，你想點${text}型的飲料．`);
                
            } else {
                await turnContext.sendActivity('看來你不是很好的客人，請看清楚我給你的建議再回答喲，請問需要點什麼類型飲料呢??');
            }

            // After the bot has responded send the suggested actions.
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            await this.sendWelcomeMessage(turnContext);
        } else {
            await turnContext.sendActivity(`[${turnContext.activity.type} event detected.]`);
        }
    }

    /**
     * Send a welcome message along with suggested actions for the user to click.
     * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
     */
    async sendWelcomeMessage(turnContext) {
        const activity = turnContext.activity;
        if (activity.membersAdded) {
            // Iterate over all new members added to the conversation.
            for (const idx in activity.membersAdded) {
                if (activity.membersAdded[idx].id !== activity.recipient.id) {
                    const welcomeMessage = '你好，歡迎來到五十難飲料店，以下將為您提供簡易的點餐服務，如有服務不周的部分，那我也沒辦法～';
                    await turnContext.sendActivity(welcomeMessage);
                    await this.sendSuggestedActions(turnContext);
                }
            }
        }
    }

    /**
     * Send suggested actions to the user.
     * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
     */
    async sendSuggestedActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['茶類', '奶類', '果汁類'], '請問需要點什麼類型飲料呢?');
        await turnContext.sendActivity(reply);
    }
    async sendSugarActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['茶類', '奶類', '果汁類'], '請問需要點什麼類型飲料呢?');
        await turnContext.sendActivity(reply);
    }
    async sendIceActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['茶類', '奶類', '果汁類'], '請問需要點什麼類型飲料呢?');
        await turnContext.sendActivity(reply);
    }
    async sendSizeActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['茶類', '奶類', '果汁類'], '請問需要點什麼類型飲料呢?');
        await turnContext.sendActivity(reply);
    }
    async sendNumberActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['茶類', '奶類', '果汁類'], '請問需要點什麼類型飲料呢?');
        await turnContext.sendActivity(reply);
    }
}

module.exports.MyBot = MyBot;
