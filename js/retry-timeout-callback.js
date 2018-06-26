/*******************************************************************************
* Copyright (c) 2017 IBM Corporation and others.
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
*     IBM Corporation - initial API and implementation
*******************************************************************************/
var retryTimeoutCallback = (function() {

    var bankServiceFileName = "BankService.java";
    var htmlRootDir = "/guides/iguide-retry-timeout/html/";
    var __browserTransactionBaseURL = "https://global-ebank.openliberty.io/transactions";

    var listenToEditorForFeatureInServerXML = function(editor) {
        var saveServerXML = function(editor) {
            __saveServerXML(editor);
        };
        editor.addSaveListener(saveServerXML);
    };

    var addMicroProfileFaultToleranceFeatureButton = function(event) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            __addMicroProfileFaultToleranceFeature();
        }
    };

    var __addMicroProfileFaultToleranceFeature = function() {
        var FTFeature = "      <feature>mpFaultTolerance-1.0</feature>";
        var stepName = stepContent.getCurrentStepName();
        var serverFileName = "server.xml";

        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetTabbedEditorContents(stepName, serverFileName);
        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);

        contentManager.insertTabbedEditorContents(stepName, serverFileName, 7, FTFeature);
        var readOnlyLines = [];
        // mark cdi feature line readonly
        readOnlyLines.push({
            from: 6,
            to: 6
        });
        contentManager.markTabbedEditorReadOnlyLines(stepName, serverFileName, readOnlyLines);
    };

    var __getMicroProfileFaultToleranceFeatureContent = function(content) {
        var editorContents = {};
        try {
            // match
            // <featureManager>
            //    <anything here>
            // </featureManager>
            // and capturing groups to get content before featureManager, the feature, and after
            // featureManager content.
            var featureManagerToMatch = "([\\s\\S]*)<featureManager>([\\s\\S]*)<\\/featureManager>([\\s\\S]*)";
            var regExpToMatch = new RegExp(featureManagerToMatch, "g");
            var groups = regExpToMatch.exec(content);
            editorContents.beforeFeature = groups[1];
            editorContents.features = groups[2];
            editorContents.afterFeature = groups[3];
        }
        catch (e) {
        }
        return editorContents;
    };

    var __isFaultToleranceInFeatures = function(features) {
        var match = false;
        features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>mpFaultTolerance-1.0</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
    };

    var __isCDIInFeatures = function(features) {
        var match = false;
        features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>cdi-1.2</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
    };

    var __checkMicroProfileFaultToleranceFeatureContent = function(content) {
        var isFTFeatureThere = true;
        var editorContentBreakdown = __getMicroProfileFaultToleranceFeatureContent(content);
        if (editorContentBreakdown.hasOwnProperty("features")) {
            isFTFeatureThere =  __isFaultToleranceInFeatures(editorContentBreakdown.features) &&
                                __isCDIInFeatures(editorContentBreakdown.features);
            if (isFTFeatureThere) {
                // check for whether other stuffs are there
                var features = editorContentBreakdown.features;
                features = features.replace('\n', '');
                features = features.replace(/\s/g, '');
                if (features.length !== "<feature>mpFaultTolerance-1.0</feature><feature>servlet-3.1</feature><feature>cdi-1.2</feature><feature>jaxrs-2.0</feature>".length) {
                    isFTFeatureThere = false; // contains extra text
                }
            }
        } else {
            isFTFeatureThere = false;
        }
        return isFTFeatureThere;
    };

    var __correctEditorError = function(stepName) {
        // correct annotation/method
        switch(stepName) {
            case "AddLibertyMPFaultTolerance":
                __addMicroProfileFaultToleranceFeature();
                break;
            case "TimeoutAnnotation":
                __addTimeoutInEditor(stepName);
                break;
            case "AddRetryOnRetry":
                __addRetryOnRetryInEditor(stepName);
                break;
            case "AddLimitsRetry":
                __addLimitsRetryInEditor(stepName);
                break;
            case "AddDelayRetry":
                __addDelayRetryInEditor(stepName);
                break;
            case "AddJitterRetry":
                __addJitterRetryInEditor(stepName);
                break;
            case "AddAbortOnRetry":
                __addAbortOnRetryInEditor(stepName);
                break;
        }
    };

    var __saveServerXML = function(editor) {
        var stepName = stepContent.getCurrentStepName();
        var serverFileName = "server.xml";

        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);
        if (__checkMicroProfileFaultToleranceFeatureContent(content)) {
            editor.closeEditorErrorBox(stepName);
            contentManager.markCurrentInstructionComplete(stepName);
        } else {
            // display error to fix it
            editor.createErrorLinkForCallBack(true, __correctEditorError);
        }
    };

    var saveServerXMLButton = function(event) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            contentManager.saveTabbedEditor(stepContent.getCurrentStepName(), "server.xml");
        }
    };

    var __saveButtonEditor = function(stepName) {
        contentManager.saveTabbedEditor(stepName, bankServiceFileName);
    };

    var saveButtonEditor = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            __saveButtonEditor(stepName);
        }
    };

    var listenToEditorForTimeoutAnnotation = function(editor) {
        editor.addSaveListener(__showStartingBrowser)
    };

    var listenToEditorForInitialRetryAnnotation = function(editor) {
        editor.addSaveListener(__showStartingBrowser);
    };

    var listenToPlayground = function(editor) {
        editor.addSaveListener(__updatePlayground);
    };

    var __showStartingBrowser = function(editor) {
        var stepName = editor.getStepName();
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);

        var htmlFile;
        if (stepName === "TimeoutAnnotation") {
            htmlFile = htmlRootDir + "transaction-history-timeout.html";
        } else if (stepName === "AddRetryOnRetry"  || stepName === "AddAbortOnRetry") {
            htmlFile = htmlRootDir + "transaction-history-retry-start.html";
        }

        if (__checkEditorContent(stepName, content)) {
            editor.closeEditorErrorBox(stepName);
            var index = contentManager.getCurrentInstructionIndex();
            if (index === 0) {
                contentManager.markCurrentInstructionComplete(stepName);
                contentManager.updateWithNewInstructionNoMarkComplete(stepName);
                // display empty web browser
                contentManager.setPodContent(stepName, htmlFile);

                if (stepName === "AddAbortOnRetry") {
                    setTimeout(function () {
                        // Use a interval timer to make sure the pod content is rendered 
                        // before accessing the browser within.
                        var waitingForPodContentTimeInterval = setInterval(function () {
                            if (contentManager.getPod(stepName).contentRootElement.length === 1) {
                                clearInterval(waitingForPodContentTimeInterval);
                                var podContents = contentManager.getPod(stepName).contentRootElement;
                                // resizeTabbedEditor resizes a small editor to be the same size
                                // as the pod created.  But, on this page we have an editor that
                                // is larger than the browser in the pod ... and we need to extend
                                // the pod size to match the editor.
                                podContents.find('.wbContent').attr("style", "height: 518px;");
                            } 
                        }, 10);
                    }, 300);
                }
                
                // resize the height of the tabbed editor
                contentManager.resizeTabbedEditor(stepName);
            }
        } else {
            // display error and provide link to fix it
            editor.createErrorLinkForCallBack(true, __correctEditorError);
        }
    };

    var __checkEditorContent = function(stepName, content) {
        var contentIsCorrect = true;
        if (stepName === "TimeoutAnnotation") {
            contentIsCorrect = __validateEditorTimeoutAnnotationStep(content);
        } else if (stepName === "AddRetryOnRetry") {
            contentIsCorrect = __validateEditorRetryOnRetryStep(content);
        } else if (stepName === "AddAbortOnRetry") {
            var paramsToCheck = ["retryOn=TimeoutException.class",
                                 "maxRetries=4",
                                 "maxDuration=10",
                                 "durationUnit=ChronoUnit.SECONDS",
                                 "delay=200",
                                 "delayUnit=ChronoUnit.MILLIS",
                                 "jitter=100",
                                 "jitterDelayUnit=ChronoUnit.MILLIS",
                                 "abortOn=FileNotFoundException.class"
                                ]
            contentIsCorrect = __checkRetryAnnotationInContent(content, paramsToCheck);
        }

        return contentIsCorrect;
    };

    var __validateEditorTimeoutAnnotationStep = function(content) {
        var match = false;
        try {
            var pattern = "public class BankService {\\s*" + // readonly boundary
            "@\\s*Timeout\\s*\\(\\s*2000\\s*\\)\\s*" +
            "public Service showTransactions()"; // readonly boundary
            var regExpToMatch = new RegExp(pattern, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var __validateEditorRetryOnRetryStep = function(content) {
        var match = false;
        try {
            var pattern = "public class BankService {\\s*" + // readonly boundary
            "@Retry\\s*\\(\\s*retryOn\\s*=\\s*TimeoutException\\.class\\s*\\)\\s*" +
            "@Timeout\\(2000\\)"; // readonly boundary
            var regExpToMatch = new RegExp(pattern, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch(ex) {

        }
        return match;
    };

    var __addTimeoutInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Timeout(2000)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 7, 7, newContent, 1);
    };

    var addTimeoutButton = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            __addTimeoutInEditor(stepName);
        }
    };

    var clickTransaction = function(event, stepName, numOfRequest) {
        if (utils.isElementActivated(event)) {
            handleTransactionRequestInBrowser(stepName, numOfRequest);
        }
    };

    var handleTransactionRequestInBrowser = function(stepName, numOfRequest) {
        var browser = contentManager.getBrowser(stepName);
        var browserContentHTML = htmlRootDir + "global-eBank.html";

        var checkURL = browser.getURL().trim();
        if (checkURL === __browserTransactionBaseURL) {
            if (numOfRequest !== -1) {
                contentManager.markCurrentInstructionComplete(stepName);
            }
            if (stepName === "TransactionHistory") {
                if (numOfRequest === 0) {
                    browserContentHTML = htmlRootDir + "transaction-history.html";
                    contentManager.updateWithNewInstructionNoMarkComplete(stepName);
                } else if (numOfRequest === 1) {
                    browserContentHTML = htmlRootDir + "transaction-history-loading.html";
                }
            } else if (stepName === "TimeoutAnnotation" || stepName === "AddAbortOnRetry") {
                browserContentHTML = htmlRootDir + "transaction-history-timeout-error.html";   
            } else /** if (stepName === "AddRetryOnRetry" || stepName === "AddLimitsRetry", etc....)**/ {
                browserContentHTML = htmlRootDir + "transaction-history-loading.html";
            }
    
            browser.setBrowserContent(browserContentHTML);
    
            switch(stepName) {
                case "TransactionHistory":
                    showBrowserOverlay(browser, numOfRequest, stepName);
                    break;
                case "AddRetryOnRetry":
                    showTransactionHistory(stepName, browser);
                    break;
                case "AddLimitsRetry":
                    var playground = contentManager.getPlayground(stepName);
                    playground.startTimeline();
                    break;
                case "AddDelayRetry":
                    var playground = contentManager.getPlayground(stepName);
                    playground.startTimeline();
                    break;
                case "AddJitterRetry":
                    var playground = contentManager.getPlayground(stepName);
                    playground.startTimeline();
                    break;
            } 
        } else {
            if (checkURL !== ""){
                browser.setBrowserContent("/guides/iguide-retry-timeout/html/page-not-found.html");
            } else {
                browser.setBrowserContent("");
            }
        }
    };

    var showBrowserOverlay = function(browser, numOfRequest, stepName) {
        if (numOfRequest === 1) {
            setTimeout(function () {
                var overlayText = retryTimeoutMessages["OVERLAY_TEXT"];
                browser.enableBrowserOverlay(overlayText);
            }, 5000);
        }
    };

    var showTransactionHistory = function(stepName, browser) {
        var loadingTimeInterval = setInterval(function() {
            clearInterval(loadingTimeInterval);
//        contentManager.setBrowserURL(stepName, browserURL);
            browser.setURL(__browserTransactionBaseURL);
            browser.setBrowserContent(htmlRootDir + "transaction-history.html");
        }, 3000);  // Timeout is set to 3000 milliseconds = 2000ms timeout + some processing time
    };

    var __populateURL = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            // Click or 'Enter' or 'Space' key event...
            contentManager.setBrowserURL(stepName, __browserTransactionBaseURL);
        }
    };

    var __listenToBrowserForTransactionHistory = function(webBrowser) {
        var setBrowserContent = function(currentURL) {
            var stepName = webBrowser.getStepName();
            var currentInstructionIndex = contentManager.getCurrentInstructionIndex(stepName);
            handleTransactionRequestInBrowser(stepName, currentInstructionIndex);
        }
        webBrowser.addUpdatedURLListener(setBrowserContent);
    };

    var __listenToBrowserForTransactionHistoryAfterRetry = function(webBrowser) {
        var setBrowserContent = function(currentURL) {
            var stepName = webBrowser.getStepName();
            var numOfRequest = contentManager.getCurrentInstructionIndex(stepName);
            handleTransactionRequestInBrowser(stepName, numOfRequest);
        }
        webBrowser.addUpdatedURLListener(setBrowserContent);
    };

    var addRetryAnnotationButton = function(event, stepName) {
        if (utils.isElementActivated(event)) {
            switch (stepName) {
                case 'AddRetryOnRetry':
                    __addRetryOnRetryInEditor(stepName);
                    break;
                case 'AddLimitsRetry':
                    __addLimitsRetryInEditor(stepName);
                    break;
                case 'AddDelayRetry':
                    __addDelayRetryInEditor(stepName);
                    break;
                case 'AddJitterRetry':
                    __addJitterRetryInEditor(stepName);
                    break;
                case 'AddAbortOnRetry':
                    __addAbortOnRetryInEditor(stepName);
                    break;
            }
        }
    };

    var __addRetryOnRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 12, 12, newContent, 1);
    };

    var __addLimitsRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries = 4,\n           maxDuration = 10,\n           durationUnit = ChronoUnit.SECONDS)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 13, newContent, 4);
    };

    var __addDelayRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries = 4,\n           maxDuration = 10,\n           durationUnit = ChronoUnit.SECONDS,\n           delay = 200, delayUnit = ChronoUnit.MILLIS)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 16, newContent, 5);
    };

    var __addJitterRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries = 4,\n           maxDuration = 10,\n           durationUnit = ChronoUnit.SECONDS,\n           delay = 200, delayUnit = ChronoUnit.MILLIS,\n           jitter = 100,\n           jitterDelayUnit = ChronoUnit.MILLIS)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 17, newContent, 7);
    };

    var __addAbortOnRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries = 4,\n           maxDuration = 10,\n           durationUnit = ChronoUnit.SECONDS,\n           delay = 200, delayUnit = ChronoUnit.MILLIS,\n           jitter = 100,\n           jitterDelayUnit = ChronoUnit.MILLIS,\n           abortOn = FileNotFoundException.class)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 14, 20, newContent, 8);
    };

    var __checkRetryAnnotationInContent = function(content, parmsToCheck) {
        var annotationIsCorrect = true;
        var editorContentParts = __getEditorParts(content);
        if (editorContentParts.hasOwnProperty("retryParms")) {
            var parmsInAnnotation = __isParmInRetryAnnotation(editorContentParts.retryParms, parmsToCheck);
            if (parmsInAnnotation !== 1) {
                annotationIsCorrect = false;
            }
        } else {
            annotationIsCorrect = false;  // None specified
        }
        return annotationIsCorrect;
    };

    /**
     * Match the parameters in the annotation to those expected and their
     * expected value.
     * 
     * @param  annotationParms - inputted parms array to validate
     *                           Each entry is a string of form
     *                              name = value
     * @param  parmsToCheck - array of expected parameters and their
     *                           expected values.
     * 
     * @returns 0 if the expected parms are not present
     *          1 if there is a match for each expected parm & its value
     *          2 if there are more parms specified than expected
     */
    var __isParmInRetryAnnotation = function(annotationParms, parmsToCheck) {
        var parms = [];     // Array of parm objects { parm, value }
        var allMatch = 1;   // Assume all match

        // For each parameter, pull apart parameter name and its value
        $(annotationParms).each(function(index, element) {
            if (element.indexOf("=") !== -1) {
                parms[index] = {};
                parms[index].name = element.trim().substring(0, element.indexOf('='));
                parms[index].value = element.trim().substring(element.indexOf('=') + 1);
            }
        });

        // Now check that each expected parm (parmsToCheck array) and its
        // value exists in inputted parms.
        $(parmsToCheck).each(function(index, element) {
            var elementMatch = false;
            if (element.indexOf("=") !== -1) {
                // For each expected parameter, pull apart parameter name and its value
                var expectedParm = element.trim().substring(0, element.indexOf('='));
                var expectedValue = element.trim().substring(element.indexOf('=') + 1);

                // Loop through inputted parms to see if expected parm exists
                $(parms).each(function(parmsIndex, parmsElement) {
                    if (parmsElement.name === expectedParm &&
                        parmsElement.value === expectedValue) {
                            elementMatch = true;
                            return false;   // break out of loop
                    }
                });
            }

            if (elementMatch === false) {
                allMatch = 0;
                return false;   // break out of loop
            }
        });

        if (allMatch === 1 && annotationParms.length > parmsToCheck.length) {
            allMatch = 2 // extra Parameters
        }

        return allMatch;
    };

    /**
     * Parse the content of the editor to pull out the @Retry annotation
     * and its paramters.
     *
     * @param  content - content of the editor
     * 
     * @returns editorContents - object containing
     *              retryParms - array of strings.  Each string is of form
     *                                 retryparms=value
     *                           as specified in the content
     *              afterAnnotationContent - copy of content appearing after the
     *                           @Retry annotation
     */
    var __getEditorParts = function(content) {
        var editorContents = {};
        try {
            // match:
            //
            // public class BankService {
            //  < space or newline >
            //     @Retry(...)
            //     @Timeout(2000)
            //     public Service showTransactions()....
            //
            // and capture groups to get content before the annotation,
            // the @Retry annotation, the @Retry annotation params, and
            // content after the annotation.
            //
            // Syntax:
            //  \s to match all whitespace characters
            //  \S to match non whitespace characters
            //  \d to match digits
            //  () capturing group
            //  (?:) noncapturing group
            //
            // Result:
            //   groups[0] - same as content
            //   groups[1] - content before the @Retry annotation
            //   groups[2] - the whole @Retry annotation
            //   groups[3] - the @Retry parameters
            //   groups[4] - content after the @Retry annotation
            var codeToMatch = "([\\s\\S]*public class BankService {\\s*)" +     // Before the @Retry
                              "(@Retry" + "\\s*" + "\\(" + "\\s*" +
                              "((?:\\s*(?:retryOn|maxRetries|maxDuration|durationUnit|delay|delayUnit|jitter|jitterDelayUnit|abortOn)\\s*=\\s*[\\d\.,a-zA-Z]*)*)" +
                              "\\s*" + "\\))" +
                              "(\\s*@Timeout\\(2000\\)[\\s\\S]*)";              // After the @Retry
            var regExpToMatch = new RegExp(codeToMatch, "g");
            var groups = regExpToMatch.exec(content);

            var parms = groups[3];   // String of just the @Retry paramters
            parms = parms.replace('\n','');
            parms = parms.replace(/\s/g, '');  // Remove white space
            if (parms.trim() !== "") {
                parms = parms.split(',');
            } else {
                parms = [];
            }

            editorContents.retryParms = parms;
            editorContents.afterAnnotationContent = groups[4];

        } catch (e) {

        }
        return editorContents;
    };

    var createPlayground = function(root, stepName) {
        if(!root.selector){
            root = root.contentRootElement;
        }

        var playground = retryTimeoutPlayground.create(root, stepName);
        contentManager.setPlayground(stepName, playground, 0);
    };

    var __updatePlayground = function(editor) {
        var stepName = editor.getStepName();
        var playground = contentManager.getPlayground(stepName);
        if (playground) {
            playground.updatePlayground();
        } else { //usually should be all non-playground steps because not initialized
            if (stepName !== 'Playground') {
                var contentValid = __validateContent(editor);

                if (contentValid) {
                    var htmlFile = htmlRootDir + "transaction-history-retry-dashboard.html";
                    contentManager.setPodContent(stepName, htmlFile);
                    window.setTimeout(function(){
                        var pod = contentManager.getPod(stepName);
                        createPlayground(pod, stepName);
                        playground = contentManager.getPlayground(stepName);
                        playground.updatePlayground();
                    }, 500);
                    contentManager.resizeTabbedEditor(stepName);
                }
            }
        }
    };

    var __validateContent = function(editor) {
        var stepName = editor.getStepName();
        var content = editor.getEditorContent();
        var paramsToCheck = getParamsToCheck(stepName);
        if (__checkRetryAnnotationInContent(content, paramsToCheck)) {
            editor.closeEditorErrorBox(stepName);
            var index = contentManager.getCurrentInstructionIndex();
            if (index === 0) {
                contentManager.markCurrentInstructionComplete(stepName);
                contentManager.updateWithNewInstructionNoMarkComplete(stepName);
            }
            return true;
        } else {
            // display error and provide link to fix it
            editor.createErrorLinkForCallBack(true, __correctEditorError);
            return false;
        }
    };

    var getParamsToCheck = function(stepName) {
        var paramsToCheck = [];
        if (stepName === "AddLimitsRetry") {
            paramsToCheck = ["retryOn=TimeoutException.class",
                            "maxRetries=4",
                            "maxDuration=10",
                            "durationUnit=ChronoUnit.SECONDS"
                            ];
        } else if (stepName === "AddDelayRetry") {
            paramsToCheck = ["retryOn=TimeoutException.class",
                            "maxRetries=4",
                            "maxDuration=10",
                            "durationUnit=ChronoUnit.SECONDS",
                            "delay=200",
                            "delayUnit=ChronoUnit.MILLIS"
                            ];
        } else if (stepName === "AddJitterRetry") {
            paramsToCheck = ["retryOn=TimeoutException.class",
                            "maxRetries=4",
                            "maxDuration=10",
                            "durationUnit=ChronoUnit.SECONDS",
                            "delay=200",
                            "delayUnit=ChronoUnit.MILLIS",
                            "jitter=100",
                            "jitterDelayUnit=ChronoUnit.MILLIS"
                            ];
        }
        return paramsToCheck;
    };

    var listenToBrowserForRefresh = function(webBrowser) {
        var replayPlayground = function(currentURL) {
            var stepName = webBrowser.getStepName();
            var playground = contentManager.getPlayground(stepName);
            playground.replayPlayground();
        };
        webBrowser.addUpdatedURLListener(replayPlayground);
    };

    return {
        listenToEditorForFeatureInServerXML: listenToEditorForFeatureInServerXML,
        addMicroProfileFaultToleranceFeatureButton: addMicroProfileFaultToleranceFeatureButton,
        addMicroProfileFaultToleranceFeature: __addMicroProfileFaultToleranceFeature,
        saveServerXML: __saveServerXML,
        saveServerXMLButton: saveServerXMLButton,
        saveButtonEditor: saveButtonEditor,
        addTimeoutButton: addTimeoutButton,
        clickTransaction: clickTransaction,
        listenToEditorForTimeoutAnnotation: listenToEditorForTimeoutAnnotation,
        listenToBrowserForTransactionHistory: __listenToBrowserForTransactionHistory,
        listenToEditorForInitialRetryAnnotation: listenToEditorForInitialRetryAnnotation,
        listenToBrowserForTransactionHistoryAfterRetry: __listenToBrowserForTransactionHistoryAfterRetry,
        listenToPlayground: listenToPlayground,
        listenToBrowserForRefresh: listenToBrowserForRefresh,
        correctEditorError: __correctEditorError,
        populateURL: __populateURL,
        addRetryAnnotationButton: addRetryAnnotationButton,
        createPlayground: createPlayground
    }
})();