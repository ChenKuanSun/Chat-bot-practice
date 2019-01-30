// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your main bot dialog entry point for handling activity types

// Import required Bot Builder
const { ActivityTypes, CardFactory, MessageFactory, TurnContext } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { DialogSet, DialogTurnStatus , WaterfallDialog, TextPrompt, ChoicePrompt} = require('botbuilder-dialogs');

// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
//const USER_PROFILE_PROPERTY = 'userProfileProperty';

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
TEA_OPTIONS.push(DONE_OPTION);
// const { UserProfile } = require('./dialogs/greeting/userProfile');
// const { WelcomeCard } = require('./dialogs/welcome');
// const { GreetingDialog } = require('./dialogs/greeting');

// // Greeting Dialog ID
// const GREETING_DIALOG = 'greetingDialog';





// // LUIS service type entry as defined in the .bot file.
// const LUIS_CONFIGURATION = 'BasicBotLuisApplication';

// // Supported LUIS Intents.
// const GREETING_INTENT = 'Greeting';
// const CANCEL_INTENT = 'Cancel';
// const HELP_INTENT = 'Help';
// const NONE_INTENT = 'None';

// // Supported LUIS Entities, defined in ./dialogs/greeting/resources/greeting.lu
// const USER_NAME_ENTITIES = ['userName', 'userName_patternAny'];
// const USER_LOCATION_ENTITIES = ['userLocation', 'userLocation_patternAny'];

/**
 * Demonstrates the following concepts:
 *  Displaying a Welcome Card, using Adaptive Card technology
 *  Use LUIS to model Greetings, Help, and Cancel interactions
 *  Use a Waterfall dialog to model multi-turn conversation flow
 *  Use custom prompts to validate user input
 *  Store conversation and user state
 *  Handle conversation interruptions
 */
class BasicBot {
    // /**
    //  * Constructs the three pieces necessary for this bot to operate:
    //  * 1. StatePropertyAccessor for conversation state
    //  * 2. StatePropertyAccess for user state
    //  * 3. LUIS client
    //  * 4. DialogSet to handle our GreetingDialog
    //  *
    //  * @param {ConversationState} conversationState property accessor
    //  * @param {UserState} userState property accessor
    //  * @param {BotConfiguration} botConfig contents of the .bot file
    //  */
    // constructor(conversationState, userState, botConfig) {
    //     if (!conversationState) throw new Error('Missing parameter.  conversationState is required');
    //     if (!userState) throw new Error('Missing parameter.  userState is required');
    //     if (!botConfig) throw new Error('Missing parameter.  botConfig is required');

    //     // Add the LUIS recognizer.
    //     const luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION);
    //     if (!luisConfig || !luisConfig.appId) throw new Error('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n');
    //     const luisEndpoint = luisConfig.region && luisConfig.region.indexOf('https://') === 0 ? luisConfig.region : luisConfig.getEndpoint();
    //     this.luisRecognizer = new LuisRecognizer({
    //         applicationId: luisConfig.appId,
    //         endpoint: luisEndpoint,
    //         // CAUTION: Its better to assign and use a subscription key instead of authoring key here.
    //         endpointKey: luisConfig.authoringKey
    //     });

    //     // Create the property accessors for user and conversation state
    //     this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
    //     this.dialogStateProperty = conversationState.createProperty(DIALOG_STATE_PROPERTY);

    //     // Create top-level dialog(s)
    //     this.dialogs = new DialogSet(this.dialogStateProperty);
    //     // Add the Greeting dialog to the set
    //     this.dialogs.add(new GreetingDialog(GREETING_DIALOG, this.userProfileAccessor));

    //     this.conversationState = conversationState;
    //     this.userState = userState;
    // }
    constructor(conversationState, userState) {
        // Create the state property accessors and save the state management objects.
        this.dialogStateAccessor = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        //this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        this.conversationState = conversationState;
        // this.userState = userState;

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
                    //await this.userProfileAccessor.set(turnContext, {});
                    //await this.userState.saveChanges(turnContext);
                    await dialogContext.beginDialog(CHECK_TEA);
                    break;
                case DialogTurnStatus.complete:
                    // If we just finished the dialog, capture and display the results.
                    const teaInfo = results.result;
                    const status = '立刻為您準備，請稍候，謝謝光臨';
                    await turnContext.sendActivity(status);
                    // await this.userProfileAccessor.set(turnContext, teaInfo);
                    // await this.userState.saveChanges(turnContext);
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
    /**
     * Driver code that does one of the following:
     * 1. Display a welcome card upon receiving ConversationUpdate activity
     * 2. Use LUIS to recognize intents for incoming user message
     * 3. Start a greeting dialog
     * 4. Optionally handle Cancel or Help interruptions
     *
     * @param {Context} context turn context from the adapter
     */
//     async onTurn(context) {
//         // Handle Message activity type, which is the main activity type for shown within a conversational interface
//         // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
//         // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
//         if (context.activity.type === ActivityTypes.Message) {
//             let dialogResult;
//             // Create a dialog context
//             const dc = await this.dialogs.createContext(context);

//             // Perform a call to LUIS to retrieve results for the current activity message.
//             const results = await this.luisRecognizer.recognize(context);
//             const topIntent = LuisRecognizer.topIntent(results);

//             // update user profile property with any entities captured by LUIS
//             // This could be user responding with their name or city while we are in the middle of greeting dialog,
//             // or user saying something like 'i'm {userName}' while we have no active multi-turn dialog.
//             await this.updateUserProfile(results, context);

//             // Based on LUIS topIntent, evaluate if we have an interruption.
//             // Interruption here refers to user looking for help/ cancel existing dialog
//             const interrupted = await this.isTurnInterrupted(dc, results);
//             if (interrupted) {
//                 if (dc.activeDialog !== undefined) {
//                     // issue a re-prompt on the active dialog
//                     dialogResult = await dc.repromptDialog();
//                 } // Else: We dont have an active dialog so nothing to continue here.
//             } else {
//                 // No interruption. Continue any active dialogs.
//                 dialogResult = await dc.continueDialog();
//             }

//             // If no active dialog or no active dialog has responded,
//             if (!dc.context.responded) {
//                 // Switch on return results from any active dialog.
//                 switch (dialogResult.status) {
//                     // dc.continueDialog() returns DialogTurnStatus.empty if there are no active dialogs
//                     case DialogTurnStatus.empty:
//                         // Determine what we should do based on the top intent from LUIS.
//                         switch (topIntent) {
//                             case GREETING_INTENT:
//                                 await dc.beginDialog(GREETING_DIALOG);
//                                 break;
//                             case NONE_INTENT:
//                             default:
//                                 // None or no intent identified, either way, let's provide some help
//                                 // to the user
//                                 await dc.context.sendActivity(`I didn't understand what you just said to me.`);
//                                 break;
//                             }
//                         break;
//                     case DialogTurnStatus.waiting:
//                         // The active dialog is waiting for a response from the user, so do nothing.
//                         break;
//                     case DialogTurnStatus.complete:
//                         // All child dialogs have ended. so do nothing.
//                         break;
//                     default:
//                         // Unrecognized status from child dialog. Cancel all dialogs.
//                         await dc.cancelAllDialogs();
//                         break;
//                 }
//             }
//         } else if (context.activity.type === ActivityTypes.ConversationUpdate) {
//             // Handle ConversationUpdate activity type, which is used to indicates new members add to
//             // the conversation.
//             // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types

//             // Do we have any new members added to the conversation?
//             if (context.activity.membersAdded.length !== 0) {
//                 // Iterate over all new members added to the conversation
//                 for (var idx in context.activity.membersAdded) {
//                     // Greet anyone that was not the target (recipient) of this message
//                     // the 'bot' is the recipient for events from the channel,
//                     // context.activity.membersAdded == context.activity.recipient.Id indicates the
//                     // bot was added to the conversation.
//                     if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
//                         // Welcome user.
//                         // When activity type is "conversationUpdate" and the member joining the conversation is the bot
//                         // we will send our Welcome Adaptive Card.  This will only be sent once, when the Bot joins conversation
//                         // To learn more about Adaptive Cards, see https://aka.ms/msbot-adaptivecards for more details.
//                         const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
//                         await context.sendActivity({ attachments: [welcomeCard] });
//                     }
//                 }
//             }
//         }

//         // make sure to persist state at the end of a turn.
//         await this.conversationState.saveChanges(context);
//         await this.userState.saveChanges(context);
//     }

//     /**
//      * Look at the LUIS results and determine if we need to handle
//      * an interruptions due to a Help or Cancel intent
//      *
//      * @param {DialogContext} dc - dialog context
//      * @param {LuisResults} luisResults - LUIS recognizer results
//      */
//     async isTurnInterrupted(dc, luisResults) {
//         const topIntent = LuisRecognizer.topIntent(luisResults);

//         // see if there are anh conversation interrupts we need to handle
//         if (topIntent === CANCEL_INTENT) {
//             if (dc.activeDialog) {
//                 // cancel all active dialog (clean the stack)
//                 await dc.cancelAllDialogs();
//                 await dc.context.sendActivity(`Ok.  I've cancelled our last activity.`);
//             } else {
//                 await dc.context.sendActivity(`I don't have anything to cancel.`);
//             }
//             return true; // this is an interruption
//         }

//         if (topIntent === HELP_INTENT) {
//             await dc.context.sendActivity(`Let me try to provide some help.`);
//             await dc.context.sendActivity(`I understand greetings, being asked for help, or being asked to cancel what I am doing.`);
//             return true; // this is an interruption
//         }
//         return false; // this is not an interruption
//     }

//     /**
//      * Helper function to update user profile with entities returned by LUIS.
//      *
//      * @param {LuisResults} luisResults - LUIS recognizer results
//      * @param {DialogContext} dc - dialog context
//      */
//     async updateUserProfile(luisResult, context) {
//         // Do we have any entities?
//         if (Object.keys(luisResult.entities).length !== 1) {
//             // get userProfile object using the accessor
//             let userProfile = await this.userProfileAccessor.get(context);
//             if (userProfile === undefined) {
//                 userProfile = new UserProfile();
//             }
//             // see if we have any user name entities
//             USER_NAME_ENTITIES.forEach(name => {
//                 if (luisResult.entities[name] !== undefined) {
//                     let lowerCaseName = luisResult.entities[name][0];
//                     // capitalize and set user name
//                     userProfile.name = lowerCaseName.charAt(0).toUpperCase() + lowerCaseName.substr(1);
//                 }
//             });
//             USER_LOCATION_ENTITIES.forEach(city => {
//                 if (luisResult.entities[city] !== undefined) {
//                     let lowerCaseCity = luisResult.entities[city][0];
//                     // capitalize and set user name
//                     userProfile.city = lowerCaseCity.charAt(0).toUpperCase() + lowerCaseCity.substr(1);
//                 }
//             });
//             // set the new values
//             await this.userProfileAccessor.set(context, userProfile);
//         }
//     }
// }

module.exports.BasicBot = BasicBot;
