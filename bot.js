// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, MessageFactory, TurnContext  } = require('botbuilder');
const { DialogSet, WaterfallDialog, TextPrompt, NumberPrompt, ChoicePrompt, DialogTurnStatus } = require('botbuilder-dialogs');

// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
const USER_PROFILE_PROPERTY = 'userProfileProperty';

const WELCOME_TEXT =
    'Welcome to ComplexDialogBot. This bot provides a complex conversation, with multiple dialogs. '
    + 'Type anything to get started.';

// Define the dialog and prompt names for the bot.


const TEA_LIST = 'tea-Info';
const CHECK_TEA = 'dialog-teacheck';

const TYPEOFDRINKS = 'typeOfDrinksPrompt';
const TYPEOFTEA = 'teaType';
const SUGAROFDRINKS = 'sugarOfDrinksPrompt';
const ICEOFDRINKS = 'iceOfDrinksPrompt';
const SIZEOFDRINKS = 'sizeOfDrinksPrompt';



class MyBot {
    /**
     *
     * @param {ConversationState} conversation state object
     * @param {UserState} user state object
     */
    constructor(conversationState, userState) {
        // Create the state property accessors and save the state management objects.
        this.dialogStateAccessor = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        this.conversationState = conversationState;
        this.userState = userState;

        // Create a dialog set for the bot. It requires a DialogState accessor, with which
        // to retrieve the dialog state from the turn context.
        this.dialogs = new DialogSet(this.dialogStateAccessor);

        // Add the prompts we need to the dialog set.
        this.dialogs
            .add(new TextPrompt(TYPEOFTEA))
            .add(new TextPrompt(SUGAROFDRINKS))
            .add(new TextPrompt(ICEOFDRINKS))
            .add(new TextPrompt(SIZEOFDRINKS));
        // Add the dialogs we need to the dialog set.
        this.dialogs.add(new WaterfallDialog(CHECK_TEA)
            .addStep(this.askTypeOfTea.bind(this))
            .addStep(this.askSugarOfDrinks.bind(this))
            .addStep(this.askIceOfDrinks.bind(this))
            .addStep(this.askSizeOfDrinks.bind(this))
            .addStep(this.checklist.bind(this)));
    }

    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Run the DialogSet - let the framework identify the current state of the dialog from
            // the dialog stack and figure out what (if any) is the active dialog.
            const dialogContext = await this.dialogs.createContext(turnContext);
            const results = await dialogContext.continueDialog();
            switch (results.status) {
                case DialogTurnStatus.cancelled:
                case DialogTurnStatus.empty:
                    // If there is no active dialog, we should clear the user info and start a new dialog.
                    await this.userProfileAccessor.set(turnContext, {});
                    await this.userState.saveChanges(turnContext);
                    await dialogContext.beginDialog(CHECK_TEA);
                    break;
                case DialogTurnStatus.complete:
                    // If we just finished the dialog, capture and display the results.
                    const teaInfo = results.result;
                    const status = '以下是你點的餐點內容'
                        + teaInfo.size
                        + teaInfo.sugar
                        + teaInfo.ice
                        + teaInfo.tea
                        + '.';
                    await turnContext.sendActivity(status);
                    await this.userProfileAccessor.set(turnContext, teaInfo);
                    await this.userState.saveChanges(turnContext);
                    break;
                case DialogTurnStatus.waiting:
                    // If there is an active dialog, we don't need to do anything here.
                    break;
            }
            await this.conversationState.saveChanges(turnContext);
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            if (turnContext.activity.membersAdded && turnContext.activity.membersAdded.length > 0) {
                await this.sendWelcomeMessage(turnContext);
            }
        } else {
            await turnContext.sendActivity(`[${turnContext.activity.type} event detected]`);
        }
    }



    async askTypeOfTea(stepContext) {
        stepContext.values[TEA_LIST] = {};
        // 問茶
        return await stepContext.prompt(TYPEOFTEA, '請問要喝什麼茶呢?');
    }
    async askSugarOfDrinks(stepContext) {
        stepContext.values[TEA_LIST].tea = stepContext.result;
        // 糖度
        return await stepContext.prompt(
            SUGAROFDRINKS, MessageFactory.suggestedActions(['正常', '少糖', '半糖', '微糖', '無糖'], '糖度呢?'));
    }
    async askIceOfDrinks(stepContext) {
        stepContext.values[TEA_LIST].sugar = stepContext.result;
        // 冰塊
        return await stepContext.prompt(
            ICEOFDRINKS, MessageFactory.suggestedActions(['正常', '少冰', '半冰', '微冰', '無冰', '熱的'], '冰塊要調整嗎?'));
    }
    async askSizeOfDrinks(stepContext) {
        stepContext.values[TEA_LIST].ice = stepContext.result;
        // 大小
        return await stepContext.prompt(
            SIZEOFDRINKS, MessageFactory.suggestedActions(['大杯', '小杯'], '請問大小?'));
    }
    async checklist(stepContext) {
        stepContext.values[TEA_LIST].size = stepContext.result;

        // Exit the dialog, returning the collected user information.
        return await stepContext.endDialog(stepContext.values[TEA_LIST]);
    }
    



    // Sends a welcome message to any users who joined the conversation.
    async sendWelcomeMessage(turnContext) {
        for (var idx in turnContext.activity.membersAdded) {
            if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                await turnContext.sendActivity(WELCOME_TEXT);
            }
        }
    }
}

module.exports.MyBot = MyBot;