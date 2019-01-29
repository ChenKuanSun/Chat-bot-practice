// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, MessageFactory, TurnContext } = require('botbuilder');
const { DialogSet, WaterfallDialog, TextPrompt, NumberPrompt, ChoicePrompt, DialogTurnStatus } = require('botbuilder-dialogs');

// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
const USER_PROFILE_PROPERTY = 'userProfileProperty';

const WELCOME_TEXT =
    '歡迎光臨來到五十很難，麻煩出個聲讓我知道你是不是走錯了．';

// Define the dialog and prompt names for the bot.

const TEA_LIST = 'tea-list';
const TEA_TYPE = 'tea-Info';
const CHECK_TEA = 'dialog-teacheck';

const TYPEOFTEA = 'teaType';
const SUGAROFDRINKS = 'sugarOfDrinksPrompt';
const ICEOFDRINKS = 'iceOfDrinksPrompt';
const SIZEOFDRINKS = 'sizeOfDrinksPrompt';
const TEA_OPTIONS = [
    '茉莉綠茶',
    '阿薩姆紅茶',
    '四季春青茶',
    '黃金烏龍',
    '冰淇淋紅茶',
    '阿華田',
    '珍珠奶綠',
    '布丁奶茶']
var big_tea_price = new Array();
big_tea_price["茉莉綠茶"] = 30;
big_tea_price["阿薩姆紅茶"] = 30;  
big_tea_price["四季春青茶"] = 30;  
big_tea_price["黃金烏龍"] = 30;  
big_tea_price["冰淇淋紅茶"] = 50;  
big_tea_price["阿華田"] = 55;  
big_tea_price["珍珠奶綠"] = 50;
big_tea_price["布丁奶茶"] = 60; 
var small_tea_price = new Array();
small_tea_price["茉莉綠茶"] = 25;
small_tea_price["阿薩姆紅茶"] = 25;
small_tea_price["四季春青茶"] = 25;
small_tea_price["黃金烏龍"] = 25;
small_tea_price["冰淇淋紅茶"] = 40;
small_tea_price["阿華田"] = 45;
small_tea_price["珍珠奶綠"] = 40;
small_tea_price["布丁奶茶"] = 50; 

const DONE_OPTION = '這樣就好了！';

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
            .add(new ChoicePrompt(TYPEOFTEA))
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
                    const status = '立刻為您準備，請稍候，謝謝光臨';
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
        const list = Array.isArray(stepContext.options) ? stepContext.options : [];
        stepContext.values[TEA_LIST] = list;
        stepContext.values[TEA_TYPE] = {};
        let message;
        if (list.length === 0) {
            message = '請問要喝什麼茶呢??';
            TEA_OPTIONS.push(DONE_OPTION);
        } else {
            message = `你點了${list[list.length - 1]}. 你還有需要其他飲料嗎？` +
                '或是選`' + DONE_OPTION + '`就馬上為您結帳！';
        }
        

        // Prompt the user for a choice.
        return await stepContext.prompt(TYPEOFTEA, {
            prompt: message,
            retryPrompt: '請選選單上的茶類喔，其他我們都沒有！！',
            choices: TEA_OPTIONS
        });
        // stepContext.values[TEA_TYPE] = {};
        // // 問茶
        // return await stepContext.prompt(TYPEOFTEA, '請問要喝什麼茶呢?');
    }
    async askSugarOfDrinks(stepContext) {
        if (stepContext.result.value === DONE_OPTION) {
            stepContext.context.sendActivity('馬上為您結帳！');
            checkout(stepContext.values[TEA_LIST], stepContext);
            return await stepContext.endDialog();
        } else {
            stepContext.values[TEA_TYPE].tea = stepContext.result.value;
            // 糖度
            return await stepContext.prompt(
                SUGAROFDRINKS, MessageFactory.suggestedActions(['正常', '少糖', '半糖', '微糖', '無糖'], '糖度呢?'));
        }
    }
    async askIceOfDrinks(stepContext) {
        stepContext.values[TEA_TYPE].sugar = stepContext.result;
        // 冰塊
        return await stepContext.prompt(
            ICEOFDRINKS, MessageFactory.suggestedActions(['正常', '少冰', '微冰', '無冰', '熱的'], '冰塊要調整嗎?'));
    }
    async askSizeOfDrinks(stepContext) {
        stepContext.values[TEA_TYPE].ice = stepContext.result;
        // 大小
        return await stepContext.prompt(
            SIZEOFDRINKS, MessageFactory.suggestedActions(['大杯', '小杯'], '請問大小?'));
    }
    async checklist(stepContext) {
        stepContext.values[TEA_TYPE].size = stepContext.result;
        const list = stepContext.values[TEA_LIST];
        let message = stepContext.values[TEA_TYPE].size
            + stepContext.values[TEA_TYPE].sugar
            + stepContext.values[TEA_TYPE].ice
            + stepContext.values[TEA_TYPE].tea;
        stepContext.context.sendActivity(message);
        list.push(message
        );

        return await stepContext.replaceDialog(CHECK_TEA, list);
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
function checkout(list, stepContext) {
    var total_price_list = list.map(function (item, index, array) {
        if (item.search('大')) {
            return big_tea_price[item.substr(6)];
        } else {
            return small_tea_price[item.substr(6)];
        }
    });
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    var total_price = total_price_list.reduce(reducer);
    stepContext.context.sendActivity('以下是您點的餐點！');
    var message ='';
    for (var i = 0; i < list.length; i++) {
        message += (`${i + 1}`+ '. ' 
            + list[i].replace('正常', '') 
            + ' '
            + total_price_list[i]
            + '元\n')
    }
    stepContext.context.sendActivity(message);
    stepContext.context.sendActivity('總計 ' + total_price + ' 元');
}
module.exports.MyBot = MyBot;