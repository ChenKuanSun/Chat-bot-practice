// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, ConversationState} = require('botbuilder');
const { DialogSet, WaterfallDialog, ChoicePrompt, DialogTurnStatus } = require('botbuilder-dialogs');
// Define identifiers for state property accessors.
const DIALOG_STATE_ACCESSOR = 'dialogStateAccessor';
const RESERVATION_ACCESSOR = 'reservationAccessor';

// Define identifiers for dialogs and prompts.
const RESERVATION_DIALOG = 'reservationDialog';
const TYPEOFTEA = 'teaType';
const TYPEOFDRINKS = 'typeOfDrinksPrompt';
const SUGAROFDRINKS = 'sugarOfDrinksPrompt';
const ICEOFDRINKS = 'iceOfDrinksPrompt';
const SIZEOFDRINKS = 'sizeOfDrinksPrompt';

class MyBot {
    constructor(conversationState) {
        const conversationState = new ConversationState(memoryStorage);
        // 建立對話集和提示.
        this.dialogStateAccessor = conversationState.createProperty(DIALOG_STATE_ACCESSOR);
        this.reservationAccessor = conversationState.createProperty(RESERVATION_ACCESSOR);
        this.conversationState = conversationState;
        // ...
        this.dialogSet = new DialogSet(this.dialogStateAccessor);
        //this.dialogSet.add(new NumberPrompt(TYPEOFTEA, this.partySizeValidator));
        this.dialogSet.add(new TeaPrompt(TYPEOFTEA));
        this.dialogSet.add(new ChoicePrompt(TYPEOFDRINKS));
        this.dialogSet.add(new ChoicePrompt(SUGAROFDRINKS));
        this.dialogSet.add(new ChoicePrompt(ICEOFDRINKS));
        this.dialogSet.add(new ChoicePrompt(SIZEOFDRINKS));
        // ...
        this.dialogSet.add(new WaterfallDialog(RESERVATION_DIALOG, [
            this.askTypeOfDrinks.bind(this),
            this.askTypeOfTea.bind(this),
            this.askSugarOfDrinks.bind(this),
            this.askIceOfDrinks.bind(this),
            this.askSizeOfDrinks.bind(this)
        ]));
    }


    //實作對話步驟
    async askTypeOfDrinks(stepContext) {
        // 飲料類型
        return await stepContext.prompt(
            TYPEOFDRINKS, {
                prompt: '請問需要點什麼類型飲料呢?',
                retryPrompt: '我們這邊只有提供這些飲料喔，請再選擇一次。'
            },
            ['茶類']);
    }
    async askTypeOfTea(stepContext) {
        // 問茶
        return await stepContext.prompt(
            TYPEOFTEA, {
                prompt: '請問要喝什麼茶呢?',
                retryPrompt: '請輸入你要喝的茶喔!'
            });
    }
    async askSugarOfDrinks(stepContext) {
        // 糖度
        return await stepContext.prompt(
            SUGAROFDRINKS, {
                prompt: '糖度呢?',
                retryPrompt: '糖度呢?'
            },
            ['正常', '少糖', '半糖', '微糖', '無糖']);
    }
    async askIceOfDrinks(stepContext) {
        // 冰塊
        return await stepContext.prompt(
            ICEOFDRINKS, {
                prompt: '冰塊要調整嗎?',
                retryPrompt: '冰塊要調整嗎?'
            },
            ['正常', '少冰', '半冰', '微冰', '無冰', '熱的']);
    }
    async askSizeOfDrinks(stepContext) {
        // 大小
        return await stepContext.prompt(
            SIZEOFDRINKS, {
                prompt: '請問大小?',
                retryPrompt: '請問大小?'
            },
            ['大杯', '小杯']);
    }

    async onTurn(turnContext) {
        switch (turnContext.activity.type) {
            case ActivityTypes.Message:
                // Get the current reservation info from state.
                const reservation = await this.reservationAccessor.get(turnContext, null);

                // Generate a dialog context for our dialog set.
                const dc = await this.dialogSet.createContext(turnContext);

                if (!dc.activeDialog) {
                    // If there is no active dialog, check whether we have a reservation yet.
                    if (!reservation) {
                        // If not, start the dialog.
                        await dc.beginDialog(RESERVATION_DIALOG);
                    }
                    else {
                        // Otherwise, send a status message.
                        await turnContext.sendActivity(
                            `We'll see you ${reservation.date}.`);
                    }
                }
                else {
                    // Continue the dialog.
                    const dialogTurnResult = await dc.continueDialog();

                    // If the dialog completed this turn, record the reservation info.
                    if (dialogTurnResult.status === DialogTurnStatus.complete) {
                        await this.reservationAccessor.set(
                            turnContext,
                            dialogTurnResult.result);

                        // Send a confirmation message to the user.
                        await turnContext.sendActivity(
                            `Your party of ${dialogTurnResult.result.size} is ` +
                            `confirmed for ${dialogTurnResult.result.date}.`);
                    }
                }

                // Save the updated dialog state into the conversation state.
                await this.conversationState.saveChanges(turnContext, false);
                break;
            case ActivityTypes.EndOfConversation:
            case ActivityTypes.DeleteUserData:
                break;
            default:
                break;
        }
    }




    // async onTurn(turnContext) {
    //     // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    //     if (turnContext.activity.type === ActivityTypes.Message) {
    //         const text = turnContext.activity.text;

    //         // Create an array with the valid color options.
    //         const validColors = ['茶類', '奶類', '果汁類'];

    //         // If the `text` is in the Array, a valid color was selected and send agreement.
    //         if (validColors.includes(text)) {
    //             await turnContext.sendActivity(`好的，你想點${text}型的飲料．`);

    //         } else {
    //             await turnContext.sendActivity('看來你不是很好的客人，請看清楚我給你的建議再回答喲，請問需要點什麼類型飲料呢?');
    //         }

    //         // After the bot has responded send the suggested actions.
    //     } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
    //         await this.sendWelcomeMessage(turnContext);
    //     } else {
    //         await turnContext.sendActivity(`[${turnContext.activity.type} event detected.]`);
    //     }
    // }

    // /**
    //  * Send a welcome message along with suggested actions for the user to click.
    //  * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
    //  */
    // async sendWelcomeMessage(turnContext) {
    //     const activity = turnContext.activity;
    //     if (activity.membersAdded) {
    //         // Iterate over all new members added to the conversation.
    //         for (const idx in activity.membersAdded) {
    //             if (activity.membersAdded[idx].id !== activity.recipient.id) {
    //                 const welcomeMessage = '你好，歡迎來到五十難飲料店，以下將為您提供簡易的點餐服務，如有服務不周的部分，那我也沒辦法～';
    //                 await turnContext.sendActivity(welcomeMessage);
    //                 await this.sendSuggestedActions(turnContext);
    //             }
    //         }
    //     }
    // }

    // /**
    //  * Send suggested actions to the user.
    //  * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
    //  */
    // async sendSuggestedActions(turnContext) {
    //     var reply = MessageFactory.suggestedActions(['茶類', '奶類', '果汁類'], '請問需要點什麼類型飲料呢?');
    //     await turnContext.sendActivity(reply);
    // }
    // async sendSugarActions(turnContext) {
    //     var reply = MessageFactory.suggestedActions(['茶類', '奶類', '果汁類'], '請問需要點什麼類型飲料呢?');
    //     await turnContext.sendActivity(reply);
    // }
    // async sendIceActions(turnContext) {
    //     var reply = MessageFactory.suggestedActions(['茶類', '奶類', '果汁類'], '請問需要點什麼類型飲料呢?');
    //     await turnContext.sendActivity(reply);
    // }
    // async sendSizeActions(turnContext) {
    //     var reply = MessageFactory.suggestedActions(['茶類', '奶類', '果汁類'], '請問需要點什麼類型飲料呢?');
    //     await turnContext.sendActivity(reply);
    // }
    // async sendNumberActions(turnContext) {
    //     var reply = MessageFactory.suggestedActions(['茶類', '奶類', '果汁類'], '請問需要點什麼類型飲料呢?');
    //     await turnContext.sendActivity(reply);
    // }
}

module.exports.MyBot = MyBot;
